import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'
import YouTubeManager from '../platforms/Youtube.js'
import InstagramManager from '../platforms/Instagram.js'
import FacebookManager from '../platforms/Facebook.js'
import TikTokManager from '../platforms/Tiktok.js'
import XManager from '../platforms/X.js'
import RedditManager from '../platforms/Reddit.js'
import * as db from '../utils/db.js'
import { storeTokenByProjectID, retrieveTokenByProjectID, removeTokenByProjectID } from '../utils/token_manager.js'
import { registerUser, loginUser, loginWithGoogle, authMiddleware, projectAccessMiddleware, getUserById } from '../utils/auth.js'
import { getAvailableRegions, getRegionById, isValidRegion, getDefaultRegion } from '../utils/regions.js'
import { storeOAuthState, retrieveOAuthState } from '../utils/oauth_states.js';
import { startJobScheduler } from '../utils/job_scheduler.js';
import { createUploadJobs } from '../utils/job_creator.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const app = express()
const PORT = process.env.PORT || 6709

const baseDomain = process.env.MODE === 'prod' ? 'https://reelmia.com' : `http://localhost:5185`
const youTubeManager = new YouTubeManager();
const tiktokManager = new TikTokManager();
const instagramManager = new InstagramManager();
const facebookManager = new FacebookManager();
const xManager = new XManager();
const redditManager = new RedditManager();

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|mkv|webm/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Only video files are allowed!'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
})

app.use(cors())
app.use(bodyParser.json())
app.use('/uploads', express.static(uploadsDir))

const getVideoStats = (filePath) => {
  const stats = fs.statSync(filePath)
  const fileSizeInBytes = stats.size
  const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2)
  return {
    size: `${fileSizeInMB} MB`,
    sizeBytes: fileSizeInBytes
  }
}

app.get('/', (req, res) => {
  res.send('Reelmia API - Social Media Manager')
})

// ============================================
// WORKER ROUTES
// ============================================

//not used by workers only by admin panel
app.get('/api/workers', authMiddleware, async (req, res) => {
  try {
    await db.query(`
      UPDATE workers 
      SET status = 'offline' 
      WHERE status = 'online' 
        AND last_heartbeat < NOW() - INTERVAL '2 minutes'
    `);

    const result = await db.query(
      'SELECT * FROM workers ORDER BY registered_at DESC'
    );

    res.json({
      workers: result.rows,
      total: result.rows.length,
      online: result.rows.filter(w => w.status === 'online').length
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

app.get('/api/workers/:workerId', authMiddleware, async (req, res) => {
  try {
    const { workerId } = req.params;

    const result = await db.query(
      'SELECT * FROM workers WHERE worker_id = $1',
      [workerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

// ============================================
// JOB ROUTES (Upload Jobs)
// ============================================

app.post('/api/jobs', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { video_id, platforms, priority } = req.body;

    if (!video_id || !platforms || platforms.length === 0) {
      return res.status(400).json({ error: 'video_id and platforms are required' });
    }

    const { createUploadJobs } = await import('../utils/job_creator.js');
    const jobs = await createUploadJobs(video_id, platforms, req.project.id, priority || 0);

    res.status(201).json({
      message: 'Jobs created',
      jobs
    });
  } catch (error) {
    console.error('Error creating jobs:', error);
    res.status(500).json({ error: 'Failed to create jobs' });
  }
});

// ============================================
// ANALYTICS JOB ROUTES
// ============================================

app.post('/api/analytics-jobs', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { platforms, task_type, priority, metadata } = req.body;
    const projectId = req.project.id;

    //debug
    console.log('projectId in /api/analytics-jobs:', projectId);

    if (!platforms || platforms.length === 0) {
      return res.status(400).json({ error: 'platforms are required' });
    }

    const { createAnalyticsJobs } = await import('../utils/job_creator.js');
    const jobs = await createAnalyticsJobs(
      platforms,
      projectId,
      task_type || 'channel_analytics',
      priority || 0,
      metadata || {}
    );

    res.status(201).json({
      message: 'Analytics jobs created',
      jobs
    });
  } catch (error) {
    console.error('Error creating analytics jobs:', error);
    res.status(500).json({ error: error.message || 'Failed to create analytics jobs' });
  }
});

app.get('/api/analytics-jobs', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { status, platform } = req.query;
    const projectId = req.project.id;

    let query = `
      SELECT j.*, w.worker_name, w.hostname
      FROM worker_jobs j
      LEFT JOIN workers w ON j.worker_id = w.worker_id
      WHERE j.metadata->>'job_type' = 'analytics'
        AND j.metadata->>'project_id' = $1
    `;

    const params = [projectId.toString()];
    let paramCount = 2;

    if (status) {
      query += ` AND j.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (platform) {
      query += ` AND j.platform = $${paramCount}`;
      params.push(platform);
      paramCount++;
    }

    query += ' ORDER BY j.created_at DESC LIMIT 100';

    const result = await db.query(query, params);

    res.json({
      jobs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching analytics jobs:', error);
    res.status(500).json({ error: 'Failed to fetch analytics jobs' });
  }
});

app.get('/api/jobs', authMiddleware, async (req, res) => {
  try {
    const { status, project_id } = req.query;

    let query = `
      SELECT j.*, w.worker_name, w.hostname
      FROM worker_jobs j
      LEFT JOIN workers w ON j.worker_id = w.worker_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`j.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (project_id) {
      conditions.push(`(j.metadata->>'project_id')::bigint = $${paramCount}`);
      params.push(project_id);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY j.created_at DESC LIMIT 100';

    const result = await db.query(query, params);

    res.json({
      jobs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, fullName } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username and password are required' });
    }

    const result = await registerUser(email, username, password, fullName);
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('already exists')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password, twoFactorToken, isBackupCode } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const userResult = await db.query(
      'SELECT id, email, username, password_hash, full_name, created_at, totp_enabled, totp_secret, backup_codes FROM users WHERE email = $1 OR username = $1',
      [identifier]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const bcrypt = (await import('bcrypt')).default;
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.totp_enabled) {
      if (!twoFactorToken) {
        return res.status(200).json({
          requires2FA: true,
          userId: user.id
        });
      }

      let isValid = false;
      if (isBackupCode) {
        const { verifyBackupCode, removeBackupCode } = await import('../utils/twoFactor.js');
        const codeIndex = await verifyBackupCode(twoFactorToken, user.backup_codes || []);
        if (codeIndex >= 0) {
          isValid = true;
          await removeBackupCode(user.id, codeIndex);
        }
      } else {
        const { verifyTOTP } = await import('../utils/twoFactor.js');
        isValid = verifyTOTP(user.totp_secret, twoFactorToken);
      }

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }
    }

    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const { generateToken } = await import('../utils/auth.js');
    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Login failed' });
    }
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, fullName, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and Google ID are required' });
    }

    const result = await loginWithGoogle(email, fullName, googleId);
    res.json(result);
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ============================================
// 2FA ROUTES
// ============================================

import {
  generateTOTPSecret,
  generateQRCode,
  verifyTOTP,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
  saveTOTPSecret,
  enable2FA,
  disable2FA,
  get2FASettings,
  removeBackupCode
} from '../utils/twoFactor.js';

import {
  generatePasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  generatePasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
  getUserPasskeys,
  deletePasskey,
  updatePasskeyName
} from '../utils/passkey.js';

const challenges = new Map();

app.post('/api/auth/2fa/setup', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const { secret, otpauthUrl } = generateTOTPSecret(userEmail);
    const qrCode = await generateQRCode(otpauthUrl);

    await saveTOTPSecret(userId, secret);

    res.json({
      secret,
      qrCode
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

app.post('/api/auth/2fa/enable', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const settings = await get2FASettings(userId);
    if (!settings || !settings.totp_secret) {
      return res.status(400).json({ error: 'Please setup 2FA first' });
    }

    const isValid = verifyTOTP(settings.totp_secret, token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const backupCodes = generateBackupCodes();
    const hashedCodes = await hashBackupCodes(backupCodes);

    await enable2FA(userId, hashedCodes);

    res.json({
      success: true,
      backupCodes
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
});

app.post('/api/auth/2fa/disable', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, password } = req.body;

    if (!token && !password) {
      return res.status(400).json({ error: 'Token or password is required' });
    }

    const settings = await get2FASettings(userId);
    if (!settings || !settings.totp_enabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    let isValid = false;
    if (token) {
      isValid = verifyTOTP(settings.totp_secret, token);
    } else if (password) {
      const userResult = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );
      if (userResult.rows.length > 0 && userResult.rows[0].password_hash) {
        const bcrypt = (await import('bcrypt')).default;
        isValid = await bcrypt.compare(password, userResult.rows[0].password_hash);
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await disable2FA(userId);

    res.json({ success: true });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

app.post('/api/auth/2fa/verify', async (req, res) => {
  try {
    const { userId, token, isBackupCode } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'User ID and token are required' });
    }

    const settings = await get2FASettings(userId);
    if (!settings || !settings.totp_enabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    let isValid = false;

    if (isBackupCode) {
      const codeIndex = await verifyBackupCode(token, settings.backup_codes || []);
      if (codeIndex >= 0) {
        isValid = true;
        await removeBackupCode(userId, codeIndex);
      }
    } else {
      isValid = verifyTOTP(settings.totp_secret, token);
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ success: true, valid: true });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA token' });
  }
});

app.get('/api/auth/2fa/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await get2FASettings(userId);

    res.json({
      enabled: settings?.totp_enabled || false,
      hasBackupCodes: (settings?.backup_codes?.length || 0) > 0
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

// ============================================
// PASSKEY ROUTES
// ============================================

app.post('/api/auth/passkey/register/options', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const username = req.user.username;
    const email = req.user.email;
    const options = await generatePasskeyRegistrationOptions(userId, username, email);

    challenges.set(userId + '-register', options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Passkey registration options error:', error);
    res.status(500).json({ error: 'Failed to generate registration options' });
  }
});

app.post('/api/auth/passkey/register/verify', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { response, deviceName } = req.body;

    const expectedChallenge = challenges.get(userId + '-register');
    if (!expectedChallenge) {
      return res.status(400).json({ error: 'No challenge found' });
    }

    const verification = await verifyPasskeyRegistration(userId, response, expectedChallenge);

    if (deviceName && verification.passkeyId) {
      await updatePasskeyName(verification.passkeyId, userId, deviceName);
    }

    challenges.delete(userId + '-register');

    res.json({
      verified: verification.verified,
      passkeyId: verification.passkeyId
    });
  } catch (error) {
    console.error('Passkey registration verification error:', error);
    res.status(500).json({ error: 'Failed to verify passkey registration' });
  }
});

app.post('/api/auth/passkey/authenticate/options', async (req, res) => {
  try {
    const { email, username } = req.body;

    let userId = null;
    if (email || username) {
      const result = await db.query(
        'SELECT id FROM users WHERE email = $1 OR username = $1',
        [email || username]
      );
      if (result.rows.length > 0) {
        userId = result.rows[0].id;
      }
    }

    const options = await generatePasskeyAuthenticationOptions(userId);

    const challengeKey = userId ? userId + '-auth' : 'global-auth-' + Date.now();
    challenges.set(challengeKey, { challenge: options.challenge, timestamp: Date.now() });

    res.json({ ...options, challengeKey });
  } catch (error) {
    console.error('Passkey authentication options error:', error);
    res.status(500).json({ error: 'Failed to generate authentication options' });
  }
});

app.post('/api/auth/passkey/authenticate/verify', async (req, res) => {
  try {
    const { response, challengeKey } = req.body;

    const challengeData = challenges.get(challengeKey);
    if (!challengeData) {
      return res.status(400).json({ error: 'No challenge found' });
    }

    const verification = await verifyPasskeyAuthentication(response, challengeData.challenge);

    if (!verification.verified) {
      return res.status(401).json({ error: 'Passkey authentication failed' });
    }

    const user = await getUserById(verification.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { generateToken } = await import('../utils/auth.js');
    const token = generateToken(user);

    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [verification.userId]
    );

    challenges.delete(challengeKey);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Passkey authentication verification error:', error);
    res.status(500).json({ error: 'Failed to verify passkey authentication' });
  }
});

app.get('/api/auth/passkey/list', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const passkeys = await getUserPasskeys(userId);

    res.json(
      passkeys.map(p => ({
        id: p.id,
        deviceName: p.device_name,
        createdAt: p.created_at,
        lastUsedAt: p.last_used_at
      }))
    );
  } catch (error) {
    console.error('Get passkeys error:', error);
    res.status(500).json({ error: 'Failed to get passkeys' });
  }
});

app.delete('/api/auth/passkey/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const passkeyId = req.params.id;

    await deletePasskey(passkeyId, userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete passkey error:', error);
    res.status(500).json({ error: 'Failed to delete passkey' });
  }
});

app.patch('/api/auth/passkey/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const passkeyId = req.params.id;
    const { deviceName } = req.body;

    if (!deviceName) {
      return res.status(400).json({ error: 'Device name is required' });
    }

    await updatePasskeyName(passkeyId, userId, deviceName);

    res.json({ success: true });
  } catch (error) {
    console.error('Update passkey error:', error);
    res.status(500).json({ error: 'Failed to update passkey' });
  }
});

// ============================================
// PROJECT ROUTES
// ============================================

app.get('/api/projects', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const query = `
      SELECT 
        p.*,
        COUNT(v.id) as video_count
      FROM projects p
      LEFT JOIN videos v ON v.project_id = p.id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    const result = await db.query(query, [user_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, initials, color1, color2, user_id } = req.body;

    if (!name || !initials || !color1 || !color2 || !user_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const defaultRegion = getDefaultRegion();

    const query = `
      INSERT INTO projects (name, initials, color1, color2, user_id, region_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [name, initials, color1, color2, user_id, defaultRegion.id]);
    const project = result.rows[0];

    const memberQuery = 'INSERT INTO project_users (project_id, user_id) VALUES ($1, $2)';
    await db.query(memberQuery, [project.id, user_id]);

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, initials, color1, color2 } = req.body;

    const query = `
      UPDATE projects 
      SET name = $1, initials = $2, color1 = $3, color2 = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await db.query(query, [name, initials, color1, color2, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.patch('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, initials, color1, color2 } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (initials !== undefined) {
      updates.push(`initials = $${paramCount}`);
      values.push(initials);
      paramCount++;
    }
    if (color1 !== undefined) {
      updates.push(`color1 = $${paramCount}`);
      values.push(color1);
      paramCount++;
    }
    if (color2 !== undefined) {
      updates.push(`color2 = $${paramCount}`);
      values.push(color2);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

app.get('/api/projects/:id/users', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT u.id, u.username, u.email 
      FROM users u
      INNER JOIN project_users pu ON u.id = pu.user_id
      WHERE pu.project_id = $1
      ORDER BY u.username
    `;
    const result = await db.query(query, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project users:', error);
    res.status(500).json({ error: 'Failed to fetch project users' });
  }
});

app.post('/api/projects/:id/users', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const checkQuery = 'SELECT * FROM project_users WHERE project_id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, user_id]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'User already in project' });
    }

    const query = 'INSERT INTO project_users (project_id, user_id) VALUES ($1, $2) RETURNING *';
    await db.query(query, [id, user_id]);

    res.json({ message: 'User added to project successfully' });
  } catch (error) {
    console.error('Error adding user to project:', error);
    res.status(500).json({ error: 'Failed to add user to project' });
  }
});

app.delete('/api/projects/:id/users/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    const query = 'DELETE FROM project_users WHERE project_id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in project' });
    }

    res.json({ message: 'User removed from project successfully' });
  } catch (error) {
    console.error('Error removing user from project:', error);
    res.status(500).json({ error: 'Failed to remove user from project' });
  }
});

app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query;

    const query = `
      SELECT id, username, email 
      FROM users 
      WHERE username ILIKE $1 OR email ILIKE $1
      ORDER BY username
      LIMIT 20
    `;
    const result = await db.query(query, [`%${q}%`]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

app.patch('/api/projects/:id/preferred-worker', async (req, res) => {
  try {
    const { id } = req.params;
    const { worker_id } = req.body;

    if (worker_id) {
      const workerCheck = await db.query(
        'SELECT worker_id, worker_name, status FROM workers WHERE worker_id = $1',
        [worker_id]
      );

      if (workerCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      if (workerCheck.rows[0].status !== 'online') {
        return res.status(400).json({
          error: 'Cannot set offline worker as preferred',
          worker_status: workerCheck.rows[0].status
        });
      }
    }

    const query = `
      UPDATE projects 
      SET preferred_worker_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [worker_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Preferred worker updated',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating preferred worker:', error);
    res.status(500).json({ error: 'Failed to update preferred worker' });
  }
});

// ============================================
// REGION ROUTES
// ============================================

app.get('/api/regions', async (req, res) => {
  try {
    const regions = getAvailableRegions();
    res.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

app.get('/api/regions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const region = getRegionById(id);

    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }

    res.json(region);
  } catch (error) {
    console.error('Error fetching region:', error);
    res.status(500).json({ error: 'Failed to fetch region' });
  }
});

app.patch('/api/projects/:id/region', async (req, res) => {
  try {
    const { id } = req.params;
    const { region_id } = req.body;

    if (!region_id) {
      return res.status(400).json({ error: 'Region ID is required' });
    }

    if (!isValidRegion(region_id)) {
      return res.status(400).json({ error: 'Invalid region ID' });
    }

    const query = `
      UPDATE projects 
      SET region_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [region_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project region:', error);
    res.status(500).json({ error: 'Failed to update project region' });
  }
});

// ============================================
// VIDEO ROUTES
// ============================================

app.get('/api/videos', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const videos = await db.getVideosByProjectId(req.project.id)
    res.json(videos)
  } catch (error) {
    console.error('Error reading videos:', error)
    res.status(500).json({ error: 'Error reading videos' })
  }
})

app.get('/api/videos/:id', authMiddleware, async (req, res) => {
  try {
    const video = await db.getVideoById(req.params.id)
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    if (video.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [video.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    res.json(video)
  } catch (error) {
    console.error('Error reading video:', error)
    res.status(500).json({ error: 'Error reading video' })
  }
})

app.post('/api/upload', authMiddleware, projectAccessMiddleware, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' })
    }

    console.log('Upload - req.project:', req.project)
    console.log('Upload - req.query.project_id:', req.query.project_id)
    console.log('Upload - req.body.project_id:', req.body.project_id)

    const stats = getVideoStats(req.file.path)

    const newVideo = {
      id: Date.now().toString(),
      title: req.body.title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      filename: req.file.filename,
      originalName: req.file.originalname,
      thumbnail: req.body.thumbnail || 'https://via.placeholder.com/400x225',
      duration: '0:00',
      size: stats.size,
      sizeBytes: stats.sizeBytes,
      uploadDate: new Date().toISOString(),
      status: 'awaiting-details',
      progress: 100,
      platforms: req.body.platforms ? JSON.parse(req.body.platforms) : [],
      views: 0,
      path: req.file.path,
      project_id: req.project.id
    }

    const video = await db.createVideo(newVideo)

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: video
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    res.status(500).json({ error: 'Error uploading video' })
  }
})

app.get('/api/accounts/status', authMiddleware, projectAccessMiddleware, async (req, res) => {
  const PROJECT_ID = req.query.project_id;

  try {
    const accountDetails = {
      youtube: null,
      tiktok: null,
      instagram: null,
      facebook: null,
      x: null,
      reddit: null
    };

    try {
      const youtubeToken = await retrieveTokenByProjectID('youtube_token', PROJECT_ID);
      const youtubeInfo = await retrieveTokenByProjectID('youtube_channel_info', PROJECT_ID);
      if (youtubeToken && youtubeToken.refresh_token) {
        accountDetails.youtube = {
          name: youtubeInfo?.channelTitle || 'YouTube Channel',
          type: 'channel'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const tiktokToken = await retrieveTokenByProjectID('tiktok_token', PROJECT_ID);
      const tiktokInfo = await retrieveTokenByProjectID('tiktok_user_info', PROJECT_ID);
      if (tiktokToken && tiktokToken.access_token) {
        accountDetails.tiktok = {
          name: tiktokInfo?.display_name || tiktokInfo?.username || 'TikTok User',
          username: tiktokInfo?.username,
          type: 'user'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const instagramAccount = await retrieveTokenByProjectID('instagram_business_account', PROJECT_ID);
      if (instagramAccount && instagramAccount.username) {
        accountDetails.instagram = {
          name: instagramAccount.name || instagramAccount.username,
          username: instagramAccount.username,
          type: 'business'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const facebookAccounts = await retrieveTokenByProjectID('facebook_accounts', PROJECT_ID);
      if (facebookAccounts && facebookAccounts.data && facebookAccounts.data.length > 0) {
        const firstAccount = facebookAccounts.data[0];
        accountDetails.facebook = {
          name: firstAccount.name || 'Facebook Page',
          type: 'page'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const xToken = await retrieveTokenByProjectID('x_token', PROJECT_ID);
      const xInfo = await retrieveTokenByProjectID('x_user_info', PROJECT_ID);
      if (xToken && xToken.access_token) {
        accountDetails.x = {
          name: xInfo?.name || 'X User',
          username: xInfo?.username,
          type: 'user'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const redditToken = await retrieveTokenByProjectID('reddit_token', PROJECT_ID);
      const redditInfo = await retrieveTokenByProjectID('reddit_user_info', PROJECT_ID);
      if (redditToken && redditToken.access_token) {
        accountDetails.reddit = {
          name: redditInfo?.name || 'Reddit User',
          type: 'user'
        };
      }
    } catch (err) {
      // Not connected
    }

    res.json(accountDetails);
  } catch (error) {
    console.error('Error checking account status:', error)
    res.status(500).json({ error: 'Error checking account status' })
  }
})

app.post('/api/upload-multiple', upload.array('videos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No video files uploaded' })
    }

    const uploadedVideos = []

    for (let index = 0; index < req.files.length; index++) {
      const file = req.files[index]
      const stats = getVideoStats(file.path)
      const newVideo = {
        id: (Date.now() + index).toString(),
        title: file.originalname.replace(/\.[^/.]+$/, ''),
        filename: file.filename,
        originalName: file.originalname,
        thumbnail: 'https://via.placeholder.com/400x225',
        duration: '0:00',
        size: stats.size,
        sizeBytes: stats.sizeBytes,
        uploadDate: new Date().toISOString(),
        status: 'awaiting-details',
        progress: 100,
        platforms: [],
        views: 0,
        path: file.path
      }

      const video = await db.createVideo(newVideo)
      uploadedVideos.push(video)
    }

    res.status(201).json({
      message: `${uploadedVideos.length} videos uploaded successfully`,
      videos: uploadedVideos
    })
  } catch (error) {
    console.error('Error uploading videos:', error)
    res.status(500).json({ error: 'Error uploading videos' })
  }
})

app.patch('/api/videos/:id/duration', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { duration } = req.body

    if (!duration) {
      return res.status(400).json({ error: 'Duration is required' })
    }

    const video = await db.getVideoById(id)
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    if (video.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [video.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    const updatedVideo = await db.updateVideo(id, { duration })

    res.status(200).json({
      message: 'Duration updated successfully',
      video: updatedVideo
    })
  } catch (error) {
    console.error('Error updating duration:', error)
    res.status(500).json({ error: 'Error updating duration' })
  }
})

app.put('/api/videos/:id', authMiddleware, async (req, res) => {
  try {
    const videoCheck = await db.getVideoById(req.params.id)
    if (!videoCheck) {
      return res.status(404).json({ error: 'Video not found' })
    }

    if (videoCheck.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [videoCheck.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    const video = await db.updateVideo(req.params.id, req.body)

    res.json({
      message: 'Video updated successfully',
      video: video
    })
  } catch (error) {
    console.error('Error updating video:', error)
    res.status(500).json({ error: 'Error updating video' })
  }
})

app.patch('/api/videos/:id', authMiddleware, async (req, res) => {
  try {
    const videoCheck = await db.getVideoById(req.params.id)
    if (!videoCheck) {
      return res.status(404).json({ error: 'Video not found' })
    }

    if (videoCheck.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [videoCheck.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    const video = await db.updateVideo(req.params.id, req.body)

    res.json({
      message: 'Video details updated successfully',
      video: video
    })
  } catch (error) {
    console.error('Error updating video:', error)
    res.status(500).json({ error: 'Error updating video' })
  }
})

app.delete('/api/videos/:id', authMiddleware, async (req, res) => {
  try {
    const video = await db.getVideoById(req.params.id)

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    if (video.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [video.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    if (fs.existsSync(video.path)) {
      fs.unlinkSync(video.path)
    }

    await db.deleteVideo(req.params.id)

    res.json({ message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Error deleting video:', error)
    res.status(500).json({ error: 'Error deleting video' })
  }
})

app.get('/api/used-storage', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const totalBytes = await db.getTotalStorageUsed()

    res.json({ used_storage: totalBytes, total_storage: 5 * 1024 * 1024 * 1024 })
  } catch (error) {
    console.error('Error calculating used storage:', error)
    res.status(500).json({ error: 'Error calculating used storage' })
  }
})

app.post('/api/videos/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { videoIds } = req.body
    if (!videoIds || !Array.isArray(videoIds)) {
      return res.status(400).json({ error: 'Invalid video IDs' })
    }

    let deletedCount = 0
    const unauthorizedVideos = []

    for (const id of videoIds) {
      const video = await db.getVideoById(id)
      if (video) {
        if (video.project_id) {
          const accessResult = await db.query(
            'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
            [video.project_id, req.user.id]
          );

          if (accessResult.rows.length === 0) {
            unauthorizedVideos.push(id);
            continue;
          }
        }

        if (fs.existsSync(video.path)) {
          fs.unlinkSync(video.path)
        }
        deletedCount++
      }
    }

    const authorizedVideoIds = videoIds.filter(id => !unauthorizedVideos.includes(id))
    if (authorizedVideoIds.length > 0) {
      await db.bulkDeleteVideos(authorizedVideoIds)
    }

    res.json({
      message: `${deletedCount} videos deleted successfully`,
      deletedCount
    })
  } catch (error) {
    console.error('Error bulk deleting videos:', error)
    res.status(500).json({ error: 'Error bulk deleting videos' })
  }
})

app.post('/api/connect/:platform', async (req, res) => {
  try {

    const { platform } = req.params
    const PROJECT_ID = req.query.project_id || 1

    switch (platform) {
      case 'youtube':
        const result = await youTubeManager.authorize(PROJECT_ID);

        if (result.authUrl) {
          return res.json({ authUrl: result.authUrl });
        } else {
          return res.json({ message: 'Connected to YouTube successfully' });
        }

      case 'instagram':
        instagramManager.projectId = PROJECT_ID;
        const instagramAuth = instagramManager.generateAuthUrl();
        if (instagramAuth.auth_url) {
          return res.json({ authUrl: instagramAuth.auth_url });
        } else {
          res.json({ message: 'Connected to Instagram successfully' });
        }

      case 'facebook':
        facebookManager.projectId = PROJECT_ID;
        const facebookAuth = facebookManager.generateAuthUrl();
        if (facebookAuth.auth_url) {
          return res.json({ authUrl: facebookAuth.auth_url });
        } else {
          res.json({ message: 'Connected to Facebook successfully' });
        }
      case 'tiktok':
        tiktokManager.projectId = PROJECT_ID;
        const tiktokResult = await tiktokManager.authorize();

        if (tiktokResult.authUrl) {
          return res.json({ authUrl: tiktokResult.authUrl });
        } else {
          return res.json({ message: 'Connected to TikTok successfully' });
        }

      case 'x':
        xManager.projectId = PROJECT_ID;
        const xResult = await xManager.authorize();

        if (xResult.authUrl) {
          return res.json({ authUrl: xResult.authUrl });
        } else {
          return res.json({ message: 'Connected to X successfully' });
        }

      case 'reddit':
        console.log('Connecting to Reddit for project ID:', PROJECT_ID);
        redditManager.projectId = PROJECT_ID;
        const redditResult = await redditManager.authorize();

        if (redditResult.authUrl) {
          return res.json({ authUrl: redditResult.authUrl });
        } else {
          return res.json({ message: 'Connected to Reddit successfully' });
        }

      default:
        return res.status(400).json({ error: 'Unsupported platform' })
        break;
    }
  } catch (error) {
    console.error('Error connecting to platform:', error)
    res.status(500).json({ error: 'Error connecting to platform' })
  }
})

app.post('/api/disconnect/:platform', async (req, res) => {
  try {

    const { platform } = req.params
    const PROJECT_ID = req.query.project_id || 1

    switch (platform) {
      case 'youtube':
        removeTokenByProjectID('youtube_token', PROJECT_ID);
        removeTokenByProjectID('youtube_code', PROJECT_ID);
        removeTokenByProjectID('youtube_channel_info', PROJECT_ID);
        return res.json({ message: 'Disconnected from YouTube successfully' });

      case 'instagram':
        removeTokenByProjectID('instagram_business_account', PROJECT_ID);
        removeTokenByProjectID('instagram_token', PROJECT_ID);
        removeTokenByProjectID('instagram_code', PROJECT_ID);
        removeTokenByProjectID('facebook_accounts_for_instagram', PROJECT_ID);
        return res.json({ message: 'Disconnected from Instagram successfully' });

      case 'facebook':
        removeTokenByProjectID('facebook_token', PROJECT_ID);
        removeTokenByProjectID('facebook_code', PROJECT_ID);
        removeTokenByProjectID('facebook_accounts', PROJECT_ID);
        return res.json({ message: 'Disconnected from Facebook successfully' });

      case 'tiktok':
        removeTokenByProjectID('tiktok_token', PROJECT_ID);
        removeTokenByProjectID('tiktok_code', PROJECT_ID);
        removeTokenByProjectID('tiktok_user_info', PROJECT_ID);
        return res.json({ message: 'Disconnected from TikTok successfully' });

      case 'x':
        removeTokenByProjectID('x_token', PROJECT_ID);
        removeTokenByProjectID('x_oauth_state', PROJECT_ID);
        removeTokenByProjectID('x_user_info', PROJECT_ID);
        return res.json({ message: 'Disconnected from X successfully' });

      case 'reddit':
        removeTokenByProjectID('reddit_token', PROJECT_ID);
        removeTokenByProjectID('reddit_oauth_state', PROJECT_ID);
        removeTokenByProjectID('reddit_user_info', PROJECT_ID);
        return res.json({ message: 'Disconnected from Reddit successfully' });

      default:
        return res.status(400).json({ error: 'Unsupported platform' })
        break;
    }
  } catch (error) {
    console.error('Error connecting to platform:', error)
    res.status(500).json({ error: 'Error connecting to platform' })
  }
})

app.get('/api/connected-platforms', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const PROJECT_ID = req.project.id;
    const connectedPlatforms = [];

    try {
      const youtubeToken = await retrieveTokenByProjectID('youtube_token', PROJECT_ID);
      if (youtubeToken && youtubeToken.refresh_token) {
        connectedPlatforms.push('youtube');
      }
    } catch (err) {
      // Not connected
    }

    try {
      const tiktokToken = await retrieveTokenByProjectID('tiktok_token', PROJECT_ID);
      if (tiktokToken && tiktokToken.access_token) {
        connectedPlatforms.push('tiktok');
      }
    } catch (err) {
      // Not connected
    }

    try {
      const instagramToken = await retrieveTokenByProjectID('instagram_token', PROJECT_ID);
      const instagramAccount = await retrieveTokenByProjectID('instagram_business_account', PROJECT_ID);
      if (instagramToken && instagramAccount) {
        connectedPlatforms.push('instagram');
      }
    } catch (err) {
      // Not connected
    }

    try {
      //wtf why cant it find facebook token, i can see it in the db
      const facebookToken = await retrieveTokenByProjectID('facebook_token', PROJECT_ID);// =null
      const facebookAccounts = await retrieveTokenByProjectID('facebook_accounts', PROJECT_ID);

      console.log('---------------------------------------------------- \n\n\n');
      console.log('Facebook Token:', facebookToken);
      console.log('Facebook Accounts:', facebookAccounts);
      console.log('---------------------------------------------------- \n\n\n');

      if (facebookToken && facebookAccounts) {
        connectedPlatforms.push('facebook');
      }
    } catch (err) {
      // Not connected
    }

    try {
      const xToken = await retrieveTokenByProjectID('x_token', PROJECT_ID);
      if (xToken && xToken.access_token) {
        connectedPlatforms.push('x');
      }
    } catch (err) {
      // Not connected
    }

    try {
      const redditToken = await retrieveTokenByProjectID('reddit_token', PROJECT_ID);
      if (redditToken && redditToken.access_token) {
        connectedPlatforms.push('reddit');
      }
    } catch (err) {
      // Not connected
    }

    res.json({ platforms: connectedPlatforms });
  } catch (error) {
    console.error('Error getting connected platforms:', error);
    res.status(500).json({ error: 'Error getting connected platforms' });
  }
})

app.get('/api/oauth2callback/youtube', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    let PROJECT_ID = 2;
    if (state) {
      try {
        const stateData = await retrieveOAuthState(state);
        PROJECT_ID = stateData.project_id;
      } catch (err) {
        console.warn('Could not retrieve state for YouTube, using default PROJECT_ID=2');
      }
    }

    await storeTokenByProjectID('youtube_code', { code: code }, PROJECT_ID);
    await youTubeManager.getTokenFromCode(code, PROJECT_ID);

    try {
      const youtubeToken = await retrieveTokenByProjectID('youtube_token', PROJECT_ID);
      if (youtubeToken && youtubeToken.access_token) {
        const auth = new google.auth.OAuth2(
          process.env.YOUTUBE_CLIENT_ID,
          process.env.YOUTUBE_CLIENT_SECRET,
          process.env.YOUTUBE_REDIRECT_URI
        );
        auth.setCredentials(youtubeToken);
        const youtube = google.youtube({ version: 'v3', auth });
        const channelResponse = await youtube.channels.list({
          part: 'snippet',
          mine: true
        });
        if (channelResponse.data.items && channelResponse.data.items.length > 0) {
          await storeTokenByProjectID('youtube_channel_info', {
            channelTitle: channelResponse.data.items[0].snippet.title,
            channelId: channelResponse.data.items[0].id
          }, PROJECT_ID);
          console.log('✅ YouTube channel info stored:', channelResponse.data.items[0].snippet.title);
        }
      }
    } catch (err) {
      console.error('Error fetching YouTube channel info:', err);
    }

    res.redirect(`${baseDomain}/accounts`);
  } catch (error) {
    console.error('Error during YouTube OAuth2 callback:', error);
    res.status(500).send('Error during YouTube authorization');
  }
}); app.get('/api/oauth2callback/tiktok', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('TikTok OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await tiktokManager.exchangeCodeForToken(code, state);

    try {
      const stateData = await retrieveOAuthState(state);
      const PROJECT_ID = stateData.project_id;

      await new Promise(resolve => setTimeout(resolve, 500));

      const tiktokToken = await retrieveTokenByProjectID('tiktok_token', PROJECT_ID);
      console.log('🔍 TikTok token retrieved:', tiktokToken ? 'exists' : 'null', tiktokToken?.access_token ? 'has access_token' : 'no access_token');

      if (tiktokToken && tiktokToken.access_token) {
        const userInfoResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username', {
          headers: {
            'Authorization': `Bearer ${tiktokToken.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const responseText = await userInfoResponse.text();
        // console.log('🔍 TikTok API response status:', userInfoResponse.status);
        //console.log('🔍 TikTok API response:', responseText);

        if (userInfoResponse.ok) {
          const userData = JSON.parse(responseText);
          if (userData.data && userData.data.user) {
            await storeTokenByProjectID('tiktok_user_info', {
              display_name: userData.data.user.display_name,
              username: userData.data.user.username,
              open_id: userData.data.user.open_id
            }, PROJECT_ID);
            console.log('✅ TikTok user info stored:', userData.data.user.display_name, '@' + userData.data.user.username);
          } else {
            console.error('❌ TikTok response missing user data:', userData);
          }
        } else {
          console.error('❌ TikTok user info fetch failed:', userInfoResponse.status, responseText);
        }
      } else {
        console.error('❌ TikTok token not found or missing access_token');
      }
    } catch (err) {
      console.error('Error fetching TikTok user info:', err);
    }

    res.redirect(`${baseDomain}/accounts?tiktok=connected`);
  } catch (error) {
    console.error('Error during TikTok OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=tiktok_auth_failed`);
  }
});

app.get('/api/oauth2callback/instagram', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Instagram OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  if (!state) {
    return res.status(400).send('State parameter is missing');
  }

  try {
    const stateData = await retrieveOAuthState(state);
    const PROJECT_ID = stateData.project_id;

    await storeTokenByProjectID('instagram_code', { code: code }, PROJECT_ID);
    axios.get(instagramManager.getTokenExchangeUrl(code)).then(async (response) => {
      await storeTokenByProjectID('instagram_token', response.data, PROJECT_ID);

      axios.get(`https://graph.facebook.com/v24.0/me/accounts?access_token=${response.data.access_token}`)
        .then(async (response) => {
          await storeTokenByProjectID('facebook_accounts_for_instagram', response.data, PROJECT_ID);

          const pageAccessToken = response.data.data[0].access_token;
          axios.get(`https://graph.facebook.com/v24.0/${response.data.data[0].id}?fields=instagram_business_account&access_token=${pageAccessToken}`)
            .then(async (igResponse) => {
              const igAccountId = igResponse.data.instagram_business_account.id;

              axios.get(`https://graph.facebook.com/v24.0/${igAccountId}?fields=username,name&access_token=${pageAccessToken}`)
                .then(async (detailsResponse) => {
                  await storeTokenByProjectID('instagram_business_account', {
                    id: igAccountId,
                    username: detailsResponse.data.username,
                    name: detailsResponse.data.name
                  }, PROJECT_ID);
                });
            });
        });
    });

    res.redirect(`${baseDomain}/accounts?instagram=connected`);
  } catch (error) {
    console.error('Error during Instagram OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=instagram_auth_failed`);
  }
});

app.get('/api/oauth2callback/facebook', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Facebook OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  if (!state) {
    return res.status(400).send('State parameter is missing');
  }

  try {
    const stateData = await retrieveOAuthState(state);
    const PROJECT_ID = stateData.project_id;

    await storeTokenByProjectID('facebook_code', { code: code }, PROJECT_ID);
    axios.get(facebookManager.getTokenExchangeUrl(code)).then(async (response) => {
      await storeTokenByProjectID('facebook_token', response.data, PROJECT_ID);

      axios.get(`https://graph.facebook.com/v24.0/me/accounts?access_token=${response.data.access_token}`)
        .then(async (response) => {
          await storeTokenByProjectID('facebook_accounts', response.data, PROJECT_ID);
        });
    });

    res.redirect(`${baseDomain}/accounts?facebook=connected`);
  } catch (error) {
    console.error('Error during Facebook OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=facebook_auth_failed`);
  }
});

app.get('/api/oauth2callback/x', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('X OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await xManager.exchangeCodeForToken(code, state);

    try {
      const stateData = await retrieveOAuthState(state);
      const PROJECT_ID = stateData.project_id;
      const xToken = await retrieveTokenByProjectID('x_token', PROJECT_ID);
      if (xToken && xToken.access_token) {
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${xToken.access_token}`
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.data) {
            await storeTokenByProjectID('x_user_info', {
              name: userData.data.name,
              username: userData.data.username,
              id: userData.data.id
            }, PROJECT_ID);
            console.log('✅ X user info stored:', userData.data.name, '@' + userData.data.username);
          }
        } else {
          console.error('❌ X user info fetch failed:', userResponse.status, await userResponse.text());
        }
      }
    } catch (err) {
      console.error('Error fetching X user info:', err);
    }

    console.log('X token stored successfully');
    res.redirect(`${baseDomain}/accounts?x=connected`);
  } catch (error) {
    console.error('Error during X OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=x_auth_failed`);
  }
});

app.get('/api/oauth2callback/reddit', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error && process.env.NODE_ENV == 'prod') {
    console.error('Reddit OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    const tokenData = await redditManager.exchangeCodeForToken(code, state);

    if (tokenData.redirect === 'to_local') {
      res.redirect('http://localhost:6709/api/oauth2callback/reddit?code=' + code + '&state=' + state + '&error=' + (error || '') + '&error_description=' + (error_description || ''));
    }
    try {
      const stateData = await retrieveOAuthState(state);
      const PROJECT_ID = stateData.project_id;
      const redditToken = await retrieveTokenByProjectID('reddit_token', PROJECT_ID);
      if (redditToken && redditToken.access_token) {
        const userResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
          headers: {
            'Authorization': `Bearer ${redditToken.access_token}`,
            'User-Agent': 'ControlStudio/1.0'
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          await storeTokenByProjectID('reddit_user_info', {
            name: userData.name,
            id: userData.id
          }, PROJECT_ID);
          console.log('✅ Reddit user info stored:', userData.name);
        } else {
          console.error('❌ Reddit user info fetch failed:', userResponse.status);
        }
      }
    } catch (err) {
      console.error('Error fetching Reddit user info:', err);
    }

    console.log('Reddit token stored successfully');
    res.redirect(`${baseDomain}/accounts?reddit=connected`);
  } catch (error) {
    console.error('Error during Reddit OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=reddit_auth_failed`);
  }
});

app.get('/api/analytics/hourly', async (req, res) => {
  try {
    const { platform, project_id, hours = 48 } = req.query;
    const PROJECT_ID = project_id || 2;

    //simulate cause I need to build anoher worker to fetch hourly data from each platform
    let totalViews = 0;
    const platforms = platform ? [platform] : ['youtube', 'tiktok', 'instagram', 'facebook', 'x', 'reddit'];

    for (const plat of platforms) {
      try {
        switch (plat) {
          case 'youtube':
            const youtubeData = await youTubeManager.getVideoAnalytics();
            if (youtubeData && youtubeData.rows) {
              youtubeData.rows.forEach(row => {
                totalViews += row[1] || 0;
              });
            }
            break;
          case 'tiktok':
            const tiktokData = await tiktokManager.getUserVideos();
            if (tiktokData && tiktokData.data && tiktokData.data.videos) {
              tiktokData.data.videos.forEach(video => {
                totalViews += video.statistics?.view_count || 0;
              });
            }
            break;
          case 'instagram':
            const instagramData = await instagramManager.getUserMedia(PROJECT_ID);
            if (instagramData && instagramData.data && instagramData.data.media) {
              instagramData.data.media.forEach(media => {
                totalViews += media.video_views || media.reach || 0;
              });
            }
            break;
          case 'facebook':
            const facebookData = await facebookManager.getPageVideosWithInsights(PROJECT_ID);
            if (facebookData && facebookData.data && facebookData.data.videos) {
              facebookData.data.videos.forEach(video => {
                totalViews += video.views || 0;
              });
            }
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${plat} for hourly data:`, error);
      }
    }

    const hourlyData = [];
    const labels = [];
    const now = new Date();

    for (let i = parseInt(hours) - 1; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
      labels.push(hourStr);


      const hourOfDay = hour.getHours();
      let multiplier = 1;

      if (hourOfDay >= 12 && hourOfDay <= 20) {
        multiplier = 1.5 + Math.random() * 0.5;
      } else if (hourOfDay >= 6 && hourOfDay < 12) {
        multiplier = 1 + Math.random() * 0.3;
      } else {
        multiplier = 0.5 + Math.random() * 0.3;
      }

      const viewsForHour = Math.floor((totalViews / parseInt(hours)) * multiplier);
      hourlyData.push(viewsForHour);
    }

    res.json({
      labels,
      data: hourlyData,
      totalViews,
      hours: parseInt(hours)
    });
  } catch (error) {
    console.error('Error fetching hourly analytics:', error);
    res.status(500).json({ error: 'Error fetching hourly analytics', details: error.message });
  }
});

app.get('/api/analytics/total', async (req, res) => {
  try {
    const { platform, project_id } = req.query;
    const PROJECT_ID = project_id || 2;

    let analyticsData = {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalVideos: 0,
      platforms: {},
      videos: []
    };

    if (platform) {
      try {
        switch (platform) {
          case 'youtube':
            const youtubeData = await youTubeManager.getVideoAnalytics();
            if (youtubeData && youtubeData.rows) {
              analyticsData.totalVideos = youtubeData.rows.length;
              analyticsData.videos = youtubeData.rows.map(row => ({
                platform: 'youtube',
                views: row[1] || 0,
                watchTime: row[2] || 0,
                avgViewDuration: row[3] || 0,
                likes: row[4] || 0,
                subscribers: row[5] || 0,
                comments: row[6] || 0
              }));

              youtubeData.rows.forEach(row => {
                analyticsData.totalViews += row[1] || 0;
                analyticsData.totalLikes += row[4] || 0;
                analyticsData.totalComments += row[6] || 0;
              });
            }
            break;

          case 'tiktok':
            const tiktokData = await tiktokManager.getUserVideos();
            if (tiktokData && tiktokData.data && tiktokData.data.videos) {
              analyticsData.totalVideos = tiktokData.data.videos.length;
              analyticsData.videos = tiktokData.data.videos.map(video => ({
                platform: 'tiktok',
                id: video.id,
                title: video.title,
                views: video.statistics?.view_count || 0,
                likes: video.statistics?.like_count || 0,
                comments: video.statistics?.comment_count || 0,
                shares: video.statistics?.share_count || 0
              }));

              tiktokData.data.videos.forEach(video => {
                analyticsData.totalViews += video.statistics?.view_count || 0;
                analyticsData.totalLikes += video.statistics?.like_count || 0;
                analyticsData.totalComments += video.statistics?.comment_count || 0;
                analyticsData.totalShares += video.statistics?.share_count || 0;
              });
            }
            break;

          case 'instagram':
            const instagramData = await instagramManager.getUserMedia(PROJECT_ID);
            if (instagramData && instagramData.data && instagramData.data.media) {
              analyticsData.totalVideos = instagramData.data.media.length;
              analyticsData.videos = instagramData.data.media.map(media => ({
                platform: 'instagram',
                id: media.id,
                title: media.caption ? media.caption.substring(0, 50) + '...' : 'No caption',
                views: media.video_views || media.reach || 0,
                likes: media.likes || 0,
                comments: media.comments || 0,
                shares: media.shares || 0
              }));

              instagramData.data.media.forEach(media => {
                analyticsData.totalViews += media.video_views || media.reach || 0;
                analyticsData.totalLikes += media.likes || 0;
                analyticsData.totalComments += media.comments || 0;
                analyticsData.totalShares += media.shares || 0;
              });
            }
            break;

          case 'facebook':
            const facebookData = await facebookManager.getPageVideosWithInsights(PROJECT_ID);
            if (facebookData && facebookData.data && facebookData.data.videos) {
              analyticsData.totalVideos = facebookData.data.videos.length;
              analyticsData.videos = facebookData.data.videos.map(video => ({
                platform: 'facebook',
                id: video.id,
                title: video.title || 'Untitled',
                views: video.views || 0,
                likes: video.likes || 0,
                comments: video.comments || 0,
                shares: video.shares || 0
              }));

              facebookData.data.videos.forEach(video => {
                analyticsData.totalViews += video.views || 0;
                analyticsData.totalLikes += video.likes || 0;
                analyticsData.totalComments += video.comments || 0;
                analyticsData.totalShares += video.shares || 0;
              });
            }
            break;

          case 'x':
            const xData = await xManager.getAccountAnalytics({ maxResults: 10 });
            if (xData) {
              analyticsData.totalVideos = xData.tweet_count || 0;
              analyticsData.videos = xData.tweets.map(tweet => ({
                platform: 'x',
                id: tweet.id,
                title: tweet.text.substring(0, 50) + '...',
                views: tweet.public_metrics?.impression_count || 0,
                likes: tweet.public_metrics?.like_count || 0,
                comments: tweet.public_metrics?.reply_count || 0,
                shares: tweet.public_metrics?.retweet_count || 0
              }));

              analyticsData.totalViews += xData.total_impressions || 0;
              analyticsData.totalLikes += xData.total_likes || 0;
              analyticsData.totalComments += xData.total_replies || 0;
              analyticsData.totalShares += xData.total_retweets || 0;
            }
            break;

          case 'reddit':
            const redditData = await redditManager.getAccountAnalytics({ limit: 25 });
            if (redditData) {
              analyticsData.totalVideos = redditData.total_posts || 0;
              analyticsData.videos = redditData.posts.map(post => ({
                platform: 'reddit',
                id: post.id,
                title: post.title,
                views: 0, // Reddit doesn't provide view counts
                likes: post.score || 0,
                comments: post.num_comments || 0,
                shares: 0 // Reddit doesn't provide share counts
              }));

              analyticsData.totalLikes += redditData.total_score || 0;
              analyticsData.totalComments += redditData.total_comments || 0;
            }
            break;

          default:
            return res.status(400).json({ error: 'Unsupported platform' });
        }

        analyticsData.platforms[platform] = {
          views: analyticsData.totalViews,
          likes: analyticsData.totalLikes,
          comments: analyticsData.totalComments,
          shares: analyticsData.totalShares,
          videos: analyticsData.totalVideos
        };
      } catch (platformError) {
        console.error(`Error fetching ${platform} analytics:`, platformError);
        analyticsData.error = `Failed to fetch ${platform} analytics: ${platformError.message}`;
      }
    } else {
      const platforms = ['youtube', 'tiktok', 'instagram', 'facebook', 'x', 'reddit'];

      for (const plat of platforms) {
        try {
          switch (plat) {
            case 'youtube':
              const youtubeData = await youTubeManager.getVideoAnalytics();
              if (youtubeData && youtubeData.rows) {
                const platStats = {
                  views: 0,
                  likes: 0,
                  comments: 0,
                  shares: 0,
                  videos: youtubeData.rows.length
                };

                youtubeData.rows.forEach(row => {
                  const videoData = {
                    platform: 'youtube',
                    views: row[1] || 0,
                    likes: row[4] || 0,
                    comments: row[6] || 0
                  };
                  analyticsData.videos.push(videoData);

                  platStats.views += row[1] || 0;
                  platStats.likes += row[4] || 0;
                  platStats.comments += row[6] || 0;
                });

                analyticsData.platforms.youtube = platStats;
                analyticsData.totalViews += platStats.views;
                analyticsData.totalLikes += platStats.likes;
                analyticsData.totalComments += platStats.comments;
                analyticsData.totalVideos += platStats.videos;
              }
              break;

            case 'tiktok':
              const tiktokData = await tiktokManager.getUserVideos();
              if (tiktokData && tiktokData.data && tiktokData.data.videos) {
                const platStats = {
                  views: 0,
                  likes: 0,
                  comments: 0,
                  shares: 0,
                  videos: tiktokData.data.videos.length
                };

                tiktokData.data.videos.forEach(video => {
                  const videoData = {
                    platform: 'tiktok',
                    id: video.id,
                    title: video.title,
                    views: video.statistics?.view_count || 0,
                    likes: video.statistics?.like_count || 0,
                    comments: video.statistics?.comment_count || 0,
                    shares: video.statistics?.share_count || 0
                  };
                  analyticsData.videos.push(videoData);

                  platStats.views += video.statistics?.view_count || 0;
                  platStats.likes += video.statistics?.like_count || 0;
                  platStats.comments += video.statistics?.comment_count || 0;
                  platStats.shares += video.statistics?.share_count || 0;
                });

                analyticsData.platforms.tiktok = platStats;
                analyticsData.totalViews += platStats.views;
                analyticsData.totalLikes += platStats.likes;
                analyticsData.totalComments += platStats.comments;
                analyticsData.totalShares += platStats.shares;
                analyticsData.totalVideos += platStats.videos;
              }
              break;

            case 'instagram':
              const instagramData = await instagramManager.getUserMedia(PROJECT_ID);
              if (instagramData && instagramData.data && instagramData.data.media) {
                const platStats = {
                  views: 0,
                  likes: 0,
                  comments: 0,
                  shares: 0,
                  videos: instagramData.data.media.length
                };

                instagramData.data.media.forEach(media => {
                  const videoData = {
                    platform: 'instagram',
                    id: media.id,
                    title: media.caption ? media.caption.substring(0, 50) + '...' : 'No caption',
                    views: media.video_views || media.reach || 0,
                    likes: media.likes || 0,
                    comments: media.comments || 0,
                    shares: media.shares || 0
                  };
                  analyticsData.videos.push(videoData);

                  platStats.views += media.video_views || media.reach || 0;
                  platStats.likes += media.likes || 0;
                  platStats.comments += media.comments || 0;
                  platStats.shares += media.shares || 0;
                });

                analyticsData.platforms.instagram = platStats;
                analyticsData.totalViews += platStats.views;
                analyticsData.totalLikes += platStats.likes;
                analyticsData.totalComments += platStats.comments;
                analyticsData.totalShares += platStats.shares;
                analyticsData.totalVideos += platStats.videos;
              }
              break;

            case 'facebook':
              const facebookData = await facebookManager.getPageVideosWithInsights(PROJECT_ID);
              if (facebookData && facebookData.data && facebookData.data.videos) {
                const platStats = {
                  views: 0,
                  likes: 0,
                  comments: 0,
                  shares: 0,
                  videos: facebookData.data.videos.length
                };

                facebookData.data.videos.forEach(video => {
                  const videoData = {
                    platform: 'facebook',
                    id: video.id,
                    title: video.title || 'Untitled',
                    views: video.views || 0,
                    likes: video.likes || 0,
                    comments: video.comments || 0,
                    shares: video.shares || 0
                  };
                  analyticsData.videos.push(videoData);

                  platStats.views += video.views || 0;
                  platStats.likes += video.likes || 0;
                  platStats.comments += video.comments || 0;
                  platStats.shares += video.shares || 0;
                });

                analyticsData.platforms.facebook = platStats;
                analyticsData.totalViews += platStats.views;
                analyticsData.totalLikes += platStats.likes;
                analyticsData.totalComments += platStats.comments;
                analyticsData.totalShares += platStats.shares;
                analyticsData.totalVideos += platStats.videos;
              }
              break;

            case 'x':
              const xData = await xManager.getAccountAnalytics({ maxResults: 10 });
              if (xData && xData.tweets) {
                const platStats = {
                  views: xData.total_impressions || 0,
                  likes: xData.total_likes || 0,
                  comments: xData.total_replies || 0,
                  shares: xData.total_retweets || 0,
                  videos: xData.tweet_count || 0
                };

                xData.tweets.forEach(tweet => {
                  const videoData = {
                    platform: 'x',
                    id: tweet.id,
                    title: tweet.text ? tweet.text.substring(0, 50) + '...' : 'No text',
                    views: tweet.public_metrics?.impression_count || 0,
                    likes: tweet.public_metrics?.like_count || 0,
                    comments: tweet.public_metrics?.reply_count || 0,
                    shares: tweet.public_metrics?.retweet_count || 0
                  };
                  analyticsData.videos.push(videoData);
                });

                analyticsData.platforms.x = platStats;
                analyticsData.totalViews += platStats.views;
                analyticsData.totalLikes += platStats.likes;
                analyticsData.totalComments += platStats.comments;
                analyticsData.totalShares += platStats.shares;
                analyticsData.totalVideos += platStats.videos;
              }
              break;

            case 'reddit':
              const redditData = await redditManager.getAccountAnalytics({ limit: 25 });
              if (redditData && redditData.posts) {
                const platStats = {
                  views: 0, // Reddit doesn't provide view counts
                  likes: redditData.total_score || 0,
                  comments: redditData.total_comments || 0,
                  shares: 0, // Reddit doesn't provide share counts
                  videos: redditData.total_posts || 0
                };

                redditData.posts.forEach(post => {
                  const videoData = {
                    platform: 'reddit',
                    id: post.id,
                    title: post.title,
                    views: 0,
                    likes: post.score || 0,
                    comments: post.num_comments || 0,
                    shares: 0
                  };
                  analyticsData.videos.push(videoData);
                });

                analyticsData.platforms.reddit = platStats;
                analyticsData.totalLikes += platStats.likes;
                analyticsData.totalComments += platStats.comments;
                analyticsData.totalVideos += platStats.videos;
              }
              break;
          }
        } catch (platformError) {
          console.error(`Error fetching ${plat} analytics:`, platformError);
          analyticsData.platforms[plat] = { error: platformError.message };
        }
      }
    }

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching total analytics:', error);
    res.status(500).json({ error: 'Error fetching analytics', details: error.message });
  }
});

// ============================================
// ACTIVITY ROUTES
// ============================================

app.get('/api/activity', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const PROJECT_ID = req.query.project_id;

    if (!PROJECT_ID) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    const videosQuery = `
      SELECT 
        id, title, filename, thumbnail, 
        upload_date, updated_at, scheduled_date, 
        published_at, status
      FROM videos 
      WHERE project_id = $1
      ORDER BY upload_date DESC
      LIMIT 100
    `;
    const videosResult = await db.query(videosQuery, [PROJECT_ID]);

    const jobsQuery = `
      SELECT 
        j.job_id, j.video_id, j.platform, 
        j.status, j.created_at, j.started_at, 
        j.completed_at, j.error_message,
        w.worker_name, w.hostname
      FROM worker_jobs j
      LEFT JOIN workers w ON j.worker_id = w.worker_id
      WHERE j.metadata->>'project_id' = $1
      ORDER BY j.created_at DESC
      LIMIT 100
    `;
    const jobsResult = await db.query(jobsQuery, [PROJECT_ID.toString()]);

    const activities = [];

    videosResult.rows.forEach(video => {
      activities.push({
        id: `upload-${video.id}`,
        type: 'upload',
        title: `Video uploaded: ${video.title}`,
        description: 'New video uploaded successfully',
        timestamp: video.upload_date,
        thumbnail: video.thumbnail,
        status: 'success',
        videoId: video.id
      });

      if (video.scheduled_date) {
        activities.push({
          id: `scheduled-${video.id}`,
          type: 'scheduled',
          title: `Video scheduled: ${video.title}`,
          description: `Scheduled for ${new Date(video.scheduled_date).toLocaleString('de-DE')}`,
          timestamp: video.upload_date,
          thumbnail: video.thumbnail,
          status: 'pending',
          videoId: video.id
        });
      }

      if (video.published_at) {
        activities.push({
          id: `published-${video.id}`,
          type: 'published',
          title: `Video published: ${video.title}`,
          description: 'Your video is now live',
          timestamp: video.published_at,
          thumbnail: video.thumbnail,
          status: 'success',
          videoId: video.id
        });
      }

      if (video.updated_at && video.updated_at !== video.upload_date) {
        activities.push({
          id: `edited-${video.id}`,
          type: 'edited',
          title: `Video updated: ${video.title}`,
          description: 'Video metadata or details updated',
          timestamp: video.updated_at,
          thumbnail: video.thumbnail,
          status: 'success',
          videoId: video.id
        });
      }
    });

    jobsResult.rows.forEach(job => {
      const video = videosResult.rows.find(v => v.id === job.video_id);
      const videoTitle = video?.title || 'Unknown Video';

      if (job.status === 'assigned' || job.status === 'processing') {
        activities.push({
          id: `job-${job.job_id}`,
          type: 'scheduled',
          title: `Processing for ${job.platform}`,
          description: `Video: ${videoTitle}${job.worker_name ? ` (Worker: ${job.worker_name})` : ''}`,
          timestamp: job.started_at || job.created_at,
          platforms: [job.platform],
          thumbnail: video?.thumbnail,
          status: 'pending',
          videoId: job.video_id,
          jobId: job.job_id
        });
      } else if (job.status === 'completed') {
        activities.push({
          id: `job-completed-${job.job_id}`,
          type: 'published',
          title: `Published on ${job.platform}`,
          description: `Video: ${videoTitle}`,
          timestamp: job.completed_at || job.created_at,
          platforms: [job.platform],
          thumbnail: video?.thumbnail,
          status: 'success',
          videoId: job.video_id,
          jobId: job.job_id
        });
      } else if (job.status === 'failed') {
        activities.push({
          id: `job-failed-${job.job_id}`,
          type: 'published',
          title: `Failed on ${job.platform}`,
          description: job.error_message || `Video: ${videoTitle}`,
          timestamp: job.completed_at || job.created_at,
          platforms: [job.platform],
          thumbnail: video?.thumbnail,
          status: 'failed',
          videoId: job.video_id,
          jobId: job.job_id
        });
      }
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      activities,
      total: activities.length
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
  }
});

app.post('/api/publish', authMiddleware, projectAccessMiddleware, async (req, res) => {
  //const platformStatuses = {}
  
  try {
    if (!req.body.videoId) {
      return res.status(400).send('videoId is required')
    }

    const video = await db.getVideoById(req.body.videoId)

    if (!video) {
      return res.status(404).send('Video not found')
    }

    if (!video.platforms || video.platforms.length === 0) {
      return res.status(400).send('No platforms selected for publishing')
    }

    console.log(video);
    console.log('Creating publish jobs for video ID:', video.id, 'on platforms:', video.platforms);
    const jobs = await createUploadJobs(video.id, video.platforms, req.project.id, video.priority || 0);

    return res.json({ message: 'Publish jobs created', jobs })
  } catch (error) {
    console.error('Error publishing video:', error)
    return res.status(500).send('Error publishing video')
  }
});
// video specific
/*app.post('/api/analytics', async (req, res) => {
  try {
    const { videoId, platform, startDate, endDate } = req.body

    if (!videoId || !platform || !startDate || !endDate) {
      return res.status(400).json({ error: 'videoId, platform, startDate, and endDate are required' })
    }

    let analyticsData = {}

    switch (platform) {
      case 'youtube':
        analyticsData = await youTubeManager.getVideoAnalytics()//videoId, startDate, endDate
        break
      case 'tiktok':
        analyticsData = await tiktokManager.getUserVideos()//videoId, startDate, endDate
        break
      case 'instagram':
        analyticsData = await youTubeManager.getVideoAnalytics(videoId, startDate, endDate)
        //  analyticsData = await instagramManager.getVideoAnalytics(videoId, startDate, endDate)
        break
      case 'facebook':
        analyticsData = await youTubeManager.getVideoAnalytics(videoId, startDate, endDate)
        //analyticsData = await facebook.getVideoAnalytics(videoId, startDate, endDate)
        break
      default:
        return res.status(400).json({ error: 'Unsupported platform' })
    }

    res.json({ analytics: analyticsData })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Error fetching analytics' })
  }
});*/

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Uploads directory: ${uploadsDir}`)
  console.log(`Database: PostgreSQL`)

  startJobScheduler(30000);
})