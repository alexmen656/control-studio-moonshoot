import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { query } from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const RP_NAME = 'Control Studio';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';

export const generatePasskeyRegistrationOptions = async (userId, username, email) => {
    const existingPasskeys = await getUserPasskeys(userId);
    const userIdBuffer = Buffer.from(userId.toString());

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: userIdBuffer,
        userName: username,
        userDisplayName: email,
        attestationType: 'none',
        excludeCredentials: existingPasskeys.map(passkey => ({
            id: Buffer.from(passkey.credential_id, 'base64'),
            type: 'public-key',
            transports: passkey.transports || [],
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform',
        },
    });

    return options;
};

export const verifyPasskeyRegistration = async (userId, response, expectedChallenge) => {
    try {
        console.log('Verifying passkey registration for user:', userId);
        console.log('Response received:', JSON.stringify(response, null, 2));

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
        });

        console.log('Verification result:', verification);

        if (!verification.verified) {
            throw new Error('Passkey registration verification failed');
        }

        const { registrationInfo } = verification;
        if (!registrationInfo) {
            throw new Error('No registration info in verification response');
        }

        const credentialID = registrationInfo.credential?.id || registrationInfo.credentialID;
        const credentialPublicKey = registrationInfo.credential?.publicKey || registrationInfo.credentialPublicKey;
        const counter = registrationInfo.credential?.counter ?? registrationInfo.counter ?? 0;

        console.log('Extracted credentialID:', credentialID);
        //console.log('Extracted credentialPublicKey:', credentialPublicKey);
        //console.log('Extracted counter:', counter);

        if (!credentialID) {
            console.error('Available registrationInfo:', registrationInfo);
            throw new Error('No credentialID in registration info');
        }

        if (!credentialPublicKey) {
            console.error('Available registrationInfo:', registrationInfo);
            throw new Error('No credentialPublicKey in registration info');
        }

        let credentialIdBase64;
        let publicKeyBase64;

        if (typeof credentialID === 'string') {
            credentialIdBase64 = Buffer.from(credentialID, 'base64url').toString('base64');
        } else {
            credentialIdBase64 = Buffer.from(credentialID).toString('base64');
        }

        if (typeof credentialPublicKey === 'string') {
            publicKeyBase64 = Buffer.from(credentialPublicKey, 'base64url').toString('base64');
        } else {
            publicKeyBase64 = Buffer.from(credentialPublicKey).toString('base64');
        }

        console.log('Stored credentialID (base64):', credentialIdBase64);

        const transports = response.response?.transports || [];

        const result = await query(
            `INSERT INTO passkeys (user_id, credential_id, public_key, counter, transports)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
                userId,
                credentialIdBase64,
                publicKeyBase64,
                counter,
                transports
            ]
        );

        console.log('Passkey stored successfully with ID:', result.rows[0].id);

        return {
            verified: true,
            passkeyId: result.rows[0].id
        };
    } catch (error) {
        console.error('Passkey registration verification error:', error);
        throw error;
    }
};

export const generatePasskeyAuthenticationOptions = async (userId = null) => {
    let allowCredentials = [];

    if (userId) {
        const passkeys = await getUserPasskeys(userId);
        allowCredentials = passkeys.map(passkey => ({
            id: Buffer.from(passkey.credential_id, 'base64'),
            type: 'public-key',
            transports: passkey.transports || [],
        }));
    }

    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
        userVerification: 'preferred',
    });

    return options;
};

export const verifyPasskeyAuthentication = async (response, expectedChallenge) => {
    try {
        const credentialIdBase64 = Buffer.from(response.id, 'base64url').toString('base64');

        const result = await query(
            'SELECT * FROM passkeys WHERE credential_id = $1',
            [credentialIdBase64]
        );

        if (result.rows.length > 0) {
            console.log('Found passkey, with id:', result.rows[0].id);
        } else {
            throw new Error(`Passkey not found. Searched for: ${credentialIdBase64}`);
        }

        const passkey = result.rows[0];

        const credential = {
            id: Buffer.from(passkey.credential_id, 'base64'),
            publicKey: Buffer.from(passkey.public_key, 'base64'),
            counter: parseInt(passkey.counter, 10),
        };

        console.log('Credential object:', {
            id_length: credential.id.length,
            publicKey_length: credential.publicKey.length,
            counter: credential.counter,
            counter_type: typeof credential.counter
        });

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            credential,
        });

        console.log('Verification successful:', verification.verified);

        if (!verification.verified) {
            throw new Error('Passkey authentication verification failed');
        }

        await query(
            'UPDATE passkeys SET counter = $1, last_used_at = CURRENT_TIMESTAMP WHERE id = $2',
            [verification.authenticationInfo.newCounter, passkey.id]
        );

        return {
            verified: true,
            userId: passkey.user_id
        };
    } catch (error) {
        console.error('Passkey authentication verification error:', error);
        throw error;
    }
};

export const getUserPasskeys = async (userId) => {
    const result = await query(
        'SELECT * FROM passkeys WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows;
};

export const deletePasskey = async (passkeyId, userId) => {
    await query(
        'DELETE FROM passkeys WHERE id = $1 AND user_id = $2',
        [passkeyId, userId]
    );
};

export const updatePasskeyName = async (passkeyId, userId, deviceName) => {
    await query(
        'UPDATE passkeys SET device_name = $1 WHERE id = $2 AND user_id = $3',
        [deviceName, passkeyId, userId]
    );
};
