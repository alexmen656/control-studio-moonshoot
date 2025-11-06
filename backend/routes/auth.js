import express from 'express';
import bcrypt from 'bcrypt';
import { authMiddleware, registerUser, loginWithGoogle, getUserById, generateToken } from '../utils/auth.js';
import { generateTOTPSecret, generateQRCode, saveTOTPSecret, get2FASettings, verifyTOTP, enable2FA, disable2FA, generateBackupCodes, hashBackupCodes, verifyBackupCode, removeBackupCode } from '../utils/twoFactor.js';
import { generatePasskeyRegistrationOptions, verifyPasskeyRegistration, updatePasskeyName, generatePasskeyAuthenticationOptions, verifyPasskeyAuthentication, getUserPasskeys, deletePasskey } from '../utils/passkey.js';
import db from '../utils/db.js';

const router = express.Router();
const challenges = new Map();

// ============================================
// BASIC AUTH ROUTES
// ============================================

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
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
        const codeIndex = await verifyBackupCode(twoFactorToken, user.backup_codes || []);
        if (codeIndex >= 0) {
          isValid = true;
          await removeBackupCode(user.id, codeIndex);
        }
      } else {
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

router.post('/google', async (req, res) => {
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

router.get('/me', authMiddleware, async (req, res) => {
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

router.post('/2fa/setup', authMiddleware, async (req, res) => {
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

router.post('/2fa/enable', authMiddleware, async (req, res) => {
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

router.post('/2fa/disable', authMiddleware, async (req, res) => {
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

router.post('/2fa/verify', async (req, res) => {
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

router.get('/2fa/status', authMiddleware, async (req, res) => {
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

router.post('/passkey/register/options', authMiddleware, async (req, res) => {
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

router.post('/passkey/register/verify', authMiddleware, async (req, res) => {
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

router.post('/passkey/authenticate/options', async (req, res) => {
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

router.post('/passkey/authenticate/verify', async (req, res) => {
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

router.get('/passkey/list', authMiddleware, async (req, res) => {
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

router.delete('/passkey/:id', authMiddleware, async (req, res) => {
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

router.patch('/passkey/:id', authMiddleware, async (req, res) => {
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

export default router;
