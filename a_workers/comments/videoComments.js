import { compactDecrypt } from 'jose';
import { jwtVerify } from 'jose';
import { importPKCS8, importSPKI } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';

dotenv.config();

// Platform comments imports
import { fetchYouTubeComments } from './platforms/youtube.js';
import { fetchTikTokComments } from './platforms/tiktok.js';
import { fetchInstagramComments } from './platforms/instagram.js';
import { fetchFacebookComments } from './platforms/facebook.js';
//import { fetchXComments } from './platforms/x.js';
//import { fetchRedditComments } from './platforms/reddit.js';

export async function fetchVideoComments(job) {
    const platform = job.platform;
    const projectId = job.metadata.project_id;
    const backendUrl = process.env.BACKEND_URL || 'https://localhost:3001';
    const workerId = process.env.WORKER_ID || `comments-worker-${uuidv4()}`;
    const httpsAgent = new https.Agent({
        cert: fs.readFileSync(`certs/worker-${workerId}.crt`),
        key: fs.readFileSync(`certs/worker-${workerId}.key`),
        ca: fs.readFileSync('certs/ca.crt'),
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3'
    });

    const workerPrivateKeyPem = fs.readFileSync('keys/private.pem', 'utf8');
    const vpsPublicKeyPem = fs.readFileSync('keys/vps-public.pem', 'utf8');

    const tokenResponse = await axios.post(
        `${backendUrl}/api/platform-token/${platform}/${projectId}`,
        {},
        { httpsAgent: httpsAgent }
    );

    const workerPrivateKey = await importPKCS8(workerPrivateKeyPem, 'RSA-OAEP');
    const { plaintext } = await compactDecrypt(tokenResponse.data, workerPrivateKey);
    const decrypted = new TextDecoder().decode(plaintext);
    const vpsPublicKey = await importSPKI(vpsPublicKeyPem, 'ES256');
    const { payload } = await jwtVerify(decrypted, vpsPublicKey);

    if (payload) {
        switch (platform) {
            case 'youtube':
                return await fetchYouTubeComments(payload, job.metadata);
            case 'tiktok':
                return await fetchTikTokComments(payload, job.metadata);
            case 'instagram':
                return await fetchInstagramComments(payload, job.metadata);
            case 'facebook':
                return await fetchFacebookComments(payload, job.metadata);
            /*case 'x':
                return await fetchXComments(payload, job.metadata);
            case 'reddit':
                return await fetchRedditComments(payload, job.metadata);*/
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }
}