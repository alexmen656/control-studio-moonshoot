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
import youtube from './platforms/Youtube.js'
import instagram from './platforms/Instagram.js'
import facebook from './platforms/Facebook.js'
import tiktok from './platforms/Tiktok.js'
import * as db from './utils/db.js'
import { storeTokenByProjectID, retrieveTokenByProjectID } from './utils/token_manager.js'
import { registerUser, loginUser, loginWithGoogle, authMiddleware, getUserById } from './utils/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const app = express()
const PORT = process.env.PORT || 6709

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
  res.send('Control Studio API - Social Media Manager')
})



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
        const { verifyBackupCode, removeBackupCode } = await import('./utils/twoFactor.js');
        const codeIndex = await verifyBackupCode(twoFactorToken, user.backup_codes || []);
        if (codeIndex >= 0) {
          isValid = true;
          await removeBackupCode(user.id, codeIndex);
        }
      } else {
        const { verifyTOTP } = await import('./utils/twoFactor.js');
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

    const { generateToken } = await import('./utils/auth.js');
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
} from './utils/twoFactor.js';

import {
  generatePasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  generatePasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
  getUserPasskeys,
  deletePasskey,
  updatePasskeyName
} from './utils/passkey.js';

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

    const { generateToken } = await import('./utils/auth.js');
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

    const query = `
      INSERT INTO projects (name, initials, color1, color2, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [name, initials, color1, color2, user_id]);
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

// ============================================
// VIDEO ROUTES
// ============================================

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await db.getVideosByProjectId(req.query.project_id)
    res.json(videos)
  } catch (error) {
    console.error('Error reading videos:', error)
    res.status(500).json({ error: 'Error reading videos' })
  }
})

app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await db.getVideoById(req.params.id)
    if (video) {
      res.json(video)
    } else {
      res.status(404).json({ error: 'Video not found' })
    }
  } catch (error) {
    console.error('Error reading video:', error)
    res.status(500).json({ error: 'Error reading video' })
  }
})

app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' })
    }

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
      path: req.file.path
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

app.get('/api/accounts/status', async (req, res) => {
  const PROJECT_ID = req.query.project_id || 1
  try {
    res.json({
      youtube: await retrieveTokenByProjectID(1, 'youtube_token', PROJECT_ID) === null ? false : true,
      tiktok: await retrieveTokenByProjectID(1, 'tiktok_token', PROJECT_ID) === null ? false : true,
      instagram: await retrieveTokenByProjectID(1, 'instagram_business_account', PROJECT_ID) === null ? false : true,
      facebook: await retrieveTokenByProjectID(1, 'facebook_accounts', PROJECT_ID) === null ? false : true
    })
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

app.patch('/api/videos/:id/duration', async (req, res) => {
  try {
    const { id } = req.params
    const { duration } = req.body

    if (!duration) {
      return res.status(400).json({ error: 'Duration is required' })
    }

    const video = await db.updateVideo(id, { duration })

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.status(200).json({
      message: 'Duration updated successfully',
      video: video
    })
  } catch (error) {
    console.error('Error updating duration:', error)
    res.status(500).json({ error: 'Error updating duration' })
  }
})

app.put('/api/videos/:id', async (req, res) => {
  try {
    const video = await db.updateVideo(req.params.id, req.body)

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json({
      message: 'Video updated successfully',
      video: video
    })
  } catch (error) {
    console.error('Error updating video:', error)
    res.status(500).json({ error: 'Error updating video' })
  }
})

app.patch('/api/videos/:id', async (req, res) => {
  try {
    const video = await db.updateVideo(req.params.id, req.body)

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json({
      message: 'Video details updated successfully',
      video: video
    })
  } catch (error) {
    console.error('Error updating video:', error)
    res.status(500).json({ error: 'Error updating video' })
  }
})

app.delete('/api/videos/:id', async (req, res) => {
  try {
    const video = await db.getVideoById(req.params.id)

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
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

app.get('/api/used-storage', async (req, res) => {
  try {
    const totalBytes = await db.getTotalStorageUsed()

    res.json({ used_storage: totalBytes, total_storage: 5 * 1024 * 1024 * 1024 })
  } catch (error) {
    console.error('Error calculating used storage:', error)
    res.status(500).json({ error: 'Error calculating used storage' })
  }
})

app.post('/api/videos/bulk-delete', async (req, res) => {
  try {
    const { videoIds } = req.body
    if (!videoIds || !Array.isArray(videoIds)) {
      return res.status(400).json({ error: 'Invalid video IDs' })
    }

    let deletedCount = 0

    for (const id of videoIds) {
      const video = await db.getVideoById(id)
      if (video) {
        if (fs.existsSync(video.path)) {
          fs.unlinkSync(video.path)
        }
        deletedCount++
      }
    }

    await db.bulkDeleteVideos(videoIds)

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
        const result = await youtube.authorize(PROJECT_ID);

        if (result.authUrl) {
          return res.json({ authUrl: result.authUrl });
        } else {
          return res.json({ message: 'Connected to YouTube successfully' });
        }

      case 'instagram':
        const instagramAuth = instagram.auth();
        if (instagramAuth.auth_url) {
          return res.json({ authUrl: instagramAuth.auth_url });
        } else {
          res.json({ message: 'Connected to Instagram successfully' });
        }

      case 'facebook':
        const facebookAuth = facebook.auth();
        if (facebookAuth.auth_url) {
          return res.json({ authUrl: facebookAuth.auth_url });
        } else {
          res.json({ message: 'Connected to Facebook successfully' });
        }
      case 'tiktok':
        const tiktokResult = await tiktok.authorize();

        if (tiktokResult.authUrl) {
          return res.json({ authUrl: tiktokResult.authUrl });
        } else {
          return res.json({ message: 'Connected to TikTok successfully' });
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

app.get('/api/oauth2callback/youtube', async (req, res) => {
  const { code } = req.query;
  //fuck this wont work because the request is comming grom google redirect, how to figure it out with state later
  const PROJECT_ID = req.query.project_id || 1;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    const PROJECT_ID = localStorage.getItem('currentProjectId') || 1;
    await storeTokenByProjectID(1, 'youtube_code', { code: code }, PROJECT_ID);
    await youtube.getTokenFromCode(code, PROJECT_ID);
    res.redirect('http://localhost:5185/accounts');
    //res.send('YouTube authorization successful! You can close this tab.');
  } catch (error) {
    console.error('Error during YouTube OAuth2 callback:', error);
    res.status(500).send('Error during YouTube authorization');
  }
});

app.get('/api/oauth2callback/tiktok', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('TikTok OAuth error:', error, error_description);
    return res.redirect(`http://localhost:5185/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await tiktok.exchangeCodeForToken(code, state);

    res.redirect('http://localhost:5185/accounts?tiktok=connected');
  } catch (error) {
    console.error('Error during TikTok OAuth2 callback:', error);
    res.redirect('http://localhost:5185/accounts?error=tiktok_auth_failed');
  }
});

app.get('/api/oauth2callback/instagram', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Instagram OAuth error:', error, error_description);
    return res.redirect(`http://localhost:5185/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    const PROJECT_ID = localStorage.getItem('currentProjectId') || 1;

    await storeTokenByProjectID(1, 'instagram_code', { code: code }, PROJECT_ID);
    axios.get(instagram.tokenExchange(code)).then(async (response) => {
      await storeTokenByProjectID(1, 'instagram_token', response.data, PROJECT_ID);

      axios.get(`https://graph.facebook.com/v24.0/me/accounts?access_token=${response.data.access_token}`)
        .then(async (response) => {
          await storeTokenByProjectID(1, 'facebook_accounts_for_instagram', response.data, PROJECT_ID);

          axios.get(`https://graph.facebook.com/v24.0/${response.data.data[0].id}?fields=instagram_business_account&access_token=${response.data.data[0].access_token}`)
            .then(async (response) => {
              await storeTokenByProjectID(1, 'instagram_business_account', response.data, PROJECT_ID);
            });
        });
    });

    res.redirect('http://localhost:5185/accounts?instagram=connected');
  } catch (error) {
    console.error('Error during Instagram OAuth2 callback:', error);
    res.redirect('http://localhost:5185/accounts?error=instagram_auth_failed');
  }
});

app.get('/api/oauth2callback/facebook', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Facebook OAuth error:', error, error_description);
    return res.redirect(`http://localhost:5185/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    const PROJECT_ID = localStorage.getItem('currentProjectId') || 1;

    await storeTokenByProjectID(1, 'facebook_code', { code: code }, PROJECT_ID);
    axios.get(facebook.tokenExchange(code)).then(async (response) => {
      await storeTokenByProjectID(1, 'facebook_token', response.data);

      axios.get(`https://graph.facebook.com/v24.0/me/accounts?access_token=${response.data.access_token}`)
        .then(async (response) => {
          await storeTokenByProjectID(1, 'facebook_accounts', response.data, PROJECT_ID);
        });
    });

    res.redirect('http://localhost:5185/accounts?facebook=connected');
  } catch (error) {
    console.error('Error during Facebook OAuth2 callback:', error);
    res.redirect('http://localhost:5185/accounts?error=facebook_auth_failed');
  }
});

app.post('/api/publish', async (req, res) => {
  const platformStatuses = {}

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

    if (video.platforms.includes('youtube')) {
      console.log('Publishing to YouTube:', video.title);
      try {
        await youtube.uploadVideo(video)
        platformStatuses.youtube = 'success'
        console.log(`✓ YouTube: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.youtube = 'failed'
        console.error('✗ YouTube: Failed -', error.message)
      }
    }

    if (video.platforms.includes('tiktok')) {
      console.log('Publishing to TikTok:', video.title);
      try {
        await tiktok.uploadVideo(video.path, video.title)
        platformStatuses.tiktok = 'success'
        console.log(`✓ TikTok: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.tiktok = 'failed'
        console.error('✗ TikTok: Failed -', error.message)
      }
    }

    if (video.platforms.includes('instagram')) {
      console.log('Publishing to Instagram:', video.title)
      const videoFile = video.path;
      const options = {
        caption: video.description,
      }

      try {
        await instagram.uploadReel({ path: videoFile }, options)
        platformStatuses.instagram = 'success'
        console.log(`✓ Instagram: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.instagram = 'failed'
        console.error('✗ Instagram: Failed -', error.message)
      }
    }

    if (video.platforms.includes('facebook')) {
      console.log('Publishing to Facebook:', video.title)
      const videoFile = video.path;
      const options = {
        title: video.title,
        description: video.description,
      };

      try {
        await facebook.uploadVideo({ path: videoFile }, options)
        platformStatuses.facebook = 'success'
        console.log(`✓ Facebook: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.facebook = 'failed'
        console.error('✗ Facebook: Failed -', error.message)
      }
    }

    const currentDate = new Date().toISOString()

    const publishStatusWithDates = {}
    Object.entries(platformStatuses).forEach(([platform, status]) => {
      if (status === 'success') {
        publishStatusWithDates[platform] = currentDate
      } else {
        publishStatusWithDates[platform] = 'failed'
      }
    })

    const allSuccess = Object.values(platformStatuses).every(status => status === 'success')
    const anySuccess = Object.values(platformStatuses).some(status => status === 'success')

    let newStatus = 'failed'
    if (allSuccess) {
      newStatus = 'published'
    } else if (anySuccess) {
      newStatus = 'partially-published'
    }

    await db.updateVideo(req.body.videoId, {
      publishStatus: publishStatusWithDates,
      status: newStatus,
      publishedAt: anySuccess ? currentDate : null
    })

    const successPlatforms = Object.entries(platformStatuses)
      .filter(([_, status]) => status === 'success')
      .map(([platform, _]) => platform)

    const failedPlatforms = Object.entries(platformStatuses)
      .filter(([_, status]) => status === 'failed')
      .map(([platform, _]) => platform)

    let message = ''
    if (successPlatforms.length > 0) {
      message += `Successfully published to: ${successPlatforms.join(', ')}`
    }
    if (failedPlatforms.length > 0) {
      if (message) message += '. '
      message += `Failed to publish to: ${failedPlatforms.join(', ')}`
    }

    res.status(200).json({
      message: message || 'Publishing completed',
      platformStatuses: platformStatuses
    })
  } catch (error) {
    console.error('Error publishing post:', error)
    res.status(500).json({
      error: 'Error publishing post',
      platformStatuses: platformStatuses
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Uploads directory: ${uploadsDir}`)
  console.log(`Database: PostgreSQL`)
})