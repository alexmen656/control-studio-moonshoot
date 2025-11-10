import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { query } from './db.js';

export const generateTOTPSecret = (email) => {
    const secret = speakeasy.generateSecret({
        name: `Reelmia (${email})`,
        issuer: 'Reelmia',
        length: 32
    });

    return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url
    };
};

export const generateQRCode = async (otpauthUrl) => {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
        return qrCodeDataURL;
    } catch (error) {
        throw new Error('Failed to generate QR code');
    }
};

export const verifyTOTP = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2
    });
};

export const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }
    return codes;
};

export const hashBackupCodes = async (codes) => {
    const bcrypt = (await import('bcrypt')).default;
    const hashedCodes = await Promise.all(
        codes.map(code => bcrypt.hash(code, 10))
    );
    return hashedCodes;
};

export const verifyBackupCode = async (code, hashedCodes) => {
    const bcrypt = (await import('bcrypt')).default;

    for (let i = 0; i < hashedCodes.length; i++) {
        const isValid = await bcrypt.compare(code, hashedCodes[i]);
        if (isValid) {
            return i;
        }
    }
    return -1;
};

export const saveTOTPSecret = async (userId, secret) => {
    await query(
        'UPDATE users SET totp_secret = $1 WHERE id = $2',
        [secret, userId]
    );
};

export const enable2FA = async (userId, backupCodes) => {
    await query(
        'UPDATE users SET totp_enabled = TRUE, backup_codes = $1 WHERE id = $2',
        [backupCodes, userId]
    );
};

export const disable2FA = async (userId) => {
    await query(
        'UPDATE users SET totp_enabled = FALSE, totp_secret = NULL, backup_codes = NULL WHERE id = $1',
        [userId]
    );
};

export const get2FASettings = async (userId) => {
    const result = await query(
        'SELECT totp_enabled, totp_secret, backup_codes FROM users WHERE id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

export const removeBackupCode = async (userId, codeIndex) => {
    const settings = await get2FASettings(userId);
    if (!settings || !settings.backup_codes) {
        return;
    }

    const backupCodes = settings.backup_codes.filter((_, index) => index !== codeIndex);

    await query(
        'UPDATE users SET backup_codes = $1 WHERE id = $2',
        [backupCodes, userId]
    );
};
