import fs from 'fs/promises';
import { google } from 'googleapis';
import fs2 from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { storeTokenByProjectID, retrieveTokenByProjectID } from '../utils/token_manager.js';
import { storeOAuthState, retrieveOAuthState } from '../utils/oauth_states.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
];

class YouTubeManager {
    constructor(options = {}) {
        this.credentialsPath = options.credentialsPath || path.join(__dirname, 'credentials.json');
        this.redirectUri = options.redirectUri || (process.env.MODE === 'prod' ? 'https://api.reelmia.com/api/oauth2callback/youtube' : 'http://localhost:6709/api/oauth2callback/youtube');
        this.projectId = options.projectId || 1;
        this.oAuth2Client = null;
        this.credentials = null;
    }

    async initialize() {
        if (!this.credentials) {
            const content = await fs.readFile(this.credentialsPath, 'utf-8');
            const { client_secret, client_id } = JSON.parse(content);
            this.credentials = { client_secret, client_id };
            this.oAuth2Client = new google.auth.OAuth2(
                client_id,
                client_secret,
                this.redirectUri
            );
        }
    }

    async authorize(projectId = this.projectId) {
        await this.initialize();

        try {
            const token = await retrieveTokenByProjectID('youtube_token', projectId);

            if (!token.refresh_token) {
                return this.generateAuthUrl(projectId);
            }

            this.oAuth2Client.setCredentials(token);
            return this.oAuth2Client;
        } catch (err) {
            console.log('No token found, need to get a new one');
            return this.generateAuthUrl(projectId);
        }
    }

    generateAuthUrl(projectId = this.projectId) {
        const state = crypto.randomBytes(16).toString('hex');

        storeOAuthState('youtube', projectId, state);

        const authUrl = this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: SCOPES,
            state: state,
        });
        return { authUrl };
    }

    async getTokenFromCode(code, projectId = this.projectId) {
        await this.initialize();

        const tokenResponse = await this.oAuth2Client.getToken(code);
        this.oAuth2Client.setCredentials(tokenResponse.tokens);

        await storeTokenByProjectID('youtube_token', tokenResponse.tokens, projectId);
        return tokenResponse.tokens;
    }

    /*async checkAuthentication(projectId = 1) {
        const auth = await this.authorize(projectId);

        if (auth.authUrl) {
            console.log('Authentication required. Visit:', auth.authUrl);
            return { authUrl: auth.authUrl };
        }

        return auth;
    }*/

    async uploadVideo(videoFile, projectId = this.projectId) {
        try {
            console.log('Starting upload process...');
            const auth = await this.authorize(projectId);

            if (auth.authUrl) {
                return { authUrl: auth.authUrl };
            }

            console.log('Credentials loaded, uploading video...');
            return await this._uploadToYouTube(auth, videoFile);
        } catch (err) {
            console.error('Error during upload process:', err);
            throw err;
        }
    }

    async _uploadToYouTube(auth, videoFile) {
        const youtube = google.youtube({ version: 'v3', auth });

        return new Promise((resolve, reject) => {
            youtube.videos.insert(
                {
                    resource: {
                        snippet: {
                            title: videoFile.title || 'Untitled Video',
                            description: videoFile.description || 'Automatically uploaded by my bot!',
                            tags: videoFile.tags || [],
                            categoryId: videoFile.categoryId || '22',
                        },
                        status: {
                            privacyStatus: videoFile.privacyStatus || 'public',
                        },
                    },
                    part: 'snippet,status',
                    media: {
                        body: fs2.createReadStream(videoFile.path),
                    },
                },
                (err, response) => {
                    if (err) {
                        console.error('YouTube API error:', err);
                        reject(err);
                        return;
                    }
                    console.log('Video uploaded:', response.data);
                    resolve(response.data);
                }
            );
        });
    }

    async getVideoAnalytics(projectId = this.projectId, options = {}) {
        const auth = await this.authorize(projectId);

        if (auth.authUrl) {
            return { authUrl: auth.authUrl };
        }

        console.log('Fetching YouTube video analytics...');
        const youtubeAnalytics = google.youtubeAnalytics('v2');

        const defaultOptions = {
            startDate: '2025-10-01',
            endDate: '2025-10-27',
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,likes,subscribersGained,comments',
            dimensions: 'video',
            maxResults: 10,
            sort: '-views',
        };

        const res = await youtubeAnalytics.reports.query({
            auth,
            ids: 'channel==MINE',
            ...defaultOptions,
            ...options,
        });

        console.log('Analytics result:', JSON.stringify(res.data, null, 2));
        return res.data;
    }

    async getChannelInfo(projectId = this.projectId) {
        const auth = await this.authorize(projectId);

        if (auth.authUrl) {
            return { authUrl: auth.authUrl };
        }

        const youtube = google.youtube({ version: 'v3', auth });
        const res = await youtube.channels.list({
            part: 'snippet,statistics',
            mine: true,
        });

        return res.data;
    }
}

export default YouTubeManager;