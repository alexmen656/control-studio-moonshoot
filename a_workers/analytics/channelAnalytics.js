import { compactDecrypt } from 'jose';
import { jwtVerify } from 'jose';
import { importPKCS8, importSPKI } from 'jose';

// Platform analytics imports
import { fetchYouTubeAnalytics } from './platforms/youtube.js';
import { fetchTikTokAnalytics } from './platforms/tiktok.js';
import { fetchInstagramAnalytics } from './platforms/instagram.js';
import { fetchFacebookAnalytics } from './platforms/facebook.js';
import { fetchXAnalytics } from './platforms/x.js';
import { fetchRedditAnalytics } from './platforms/reddit.js';

export async function fetchChannelAnalytics(job) {
    const platform = job.platform;
    const projectId = job.metadata.project_id;

    const tokenResponse = await axios.post(
        `${this.backendUrl}/api/platform-token/${platform}/${projectId}`,
        {},
        { httpsAgent: this.httpsAgent }
    );

    const workerPrivateKey = await importPKCS8(this.workerPrivateKeyPem, 'RSA-OAEP');
    const { plaintext } = await compactDecrypt(tokenResponse.data, workerPrivateKey);
    const decrypted = new TextDecoder().decode(plaintext);
    const vpsPublicKey = await importSPKI(this.vpsPublicKeyPem, 'ES256');
    const { payload } = await jwtVerify(decrypted, vpsPublicKey);
    //const useable = JSON.stringify(payload, null, 2);
    //console.log('decrypted token payload:', useable);
    //const accessToken = tokenResponse.data.access_token;

    /*if (!tokenResponse.data || !tokenResponse.data.access_token) {
  throw new Error(`No access token found for ${platform}`);
  } */

    if (payload) {
        switch (platform) {
            case 'youtube':
                return await fetchYouTubeAnalytics(payload, job.metadata);
            case 'tiktok':
                return await fetchTikTokAnalytics(payload, job.metadata);
            case 'instagram':
                return await fetchInstagramAnalytics(payload, job.metadata);
            case 'facebook':
                return await fetchFacebookAnalytics(payload, job.metadata);
            case 'x':
                return await fetchXAnalytics(payload, job.metadata);
            case 'reddit':
                return await fetchRedditAnalytics(payload, job.metadata);
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }
}