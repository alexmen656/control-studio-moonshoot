import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const algorithm = 'aes-256-gcm';
const secretKey = process.env.API_SECRET_KEY;
const iv = crypto.randomBytes(16);

export function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return {
        iv: iv.toString('hex'),
        content: encrypted,
        tag
    };
}

export function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(secretKey, 'hex'),
        Buffer.from(encrypted.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
    let decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}