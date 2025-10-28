import dotenv from 'dotenv';
import fs from 'fs/promises';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { storeTokenByProjectID, retrieveTokenByProjectID } from '../utils/token_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..', '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const DEFAULT_SCOPES = 'tweet.read tweet.write users.read offline.access';
const API_VERSION = '2';
const API_BASE_URL = 'https://api.x.com';
const UPLOAD_BASE_URL = 'https://upload.x.com';

class XManager {
    constructor(options = {}) {
        this.clientId = options.clientId || process.env.X_CLIENT_ID || '';
        this.clientSecret = options.clientSecret || process.env.X_CLIENT_SECRET || '';
        this.redirectUri = options.redirectUri || 'http://localhost:6709/api/oauth2callback/x';
        this.projectId = options.projectId || 2;
        this.scopes = options.scopes || DEFAULT_SCOPES;
        this.apiVersion = options.apiVersion || API_VERSION;

        if (!this.clientId || !this.clientSecret) {
            throw new Error('X (Twitter) Client ID and Client Secret must be provided');
        }
    }

    _generateCodeVerifier() {
        return crypto.randomBytes(32).toString('base64url');
    }

    _generateCodeChallenge(verifier) {
        return crypto.createHash('sha256').update(verifier).digest('base64url');
    }

    async authorize() {
        try {
            try {
                const token = await retrieveTokenByProjectID('x_token', this.projectId);

                if (token.expires_at && Date.now() < token.expires_at) {
                    console.log('X token found and is still valid');
                    return { accessToken: token.access_token };
                } else if (token.refresh_token) {
                    console.log('X token expired, attempting to refresh...');
                    return await this.refreshAccessToken();
                }
            } catch {
                console.log('No X token found, need to get a new one');
            }

            const codeVerifier = this._generateCodeVerifier();
            const codeChallenge = this._generateCodeChallenge(codeVerifier);
            const state = crypto.randomBytes(16).toString('hex');

            await storeTokenByProjectID('x_oauth_state', {
                code_verifier: codeVerifier,
                state: state
            }, this.projectId);

            const authUrl = new URL('https://x.com/i/oauth2/authorize');
            authUrl.searchParams.append('response_type', 'code');
            authUrl.searchParams.append('client_id', this.clientId);
            authUrl.searchParams.append('redirect_uri', this.redirectUri);
            authUrl.searchParams.append('scope', this.scopes);
            authUrl.searchParams.append('state', state);
            authUrl.searchParams.append('code_challenge', codeChallenge);
            authUrl.searchParams.append('code_challenge_method', 'S256');

            return { authUrl: authUrl.toString() };
        } catch (err) {
            console.error('Error during X authorization:', err);
            throw err;
        }
    }

    async exchangeCodeForToken(code, state) {
        try {
            const oauthState = await retrieveTokenByProjectID('x_oauth_state', this.projectId);

            if (state !== oauthState.state) {
                throw new Error('State mismatch - possible CSRF attack');
            }

            const params = new URLSearchParams({
                code: code,
                grant_type: 'authorization_code',
                client_id: this.clientId,
                redirect_uri: this.redirectUri,
                code_verifier: oauthState.code_verifier
            });

            const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            const response = await axios.post(`${API_BASE_URL}/2/oauth2/token`, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authHeader}`
                }
            });

            const tokenData = response.data;

            const tokenWithExpiry = {
                ...tokenData,
                expires_at: Date.now() + (tokenData.expires_in * 1000)
            };

            await storeTokenByProjectID('x_token', tokenWithExpiry, this.projectId);
            console.log('X token stored successfully');

            return tokenWithExpiry;
        } catch (err) {
            console.error('Error exchanging code for token:', err.response?.data || err.message);
            throw err;
        }
    }

    async refreshAccessToken() {
        try {
            const tokenData = await retrieveTokenByProjectID('x_token', this.projectId);

            if (!tokenData.refresh_token) {
                throw new Error('No refresh token available');
            }

            const params = new URLSearchParams({
                refresh_token: tokenData.refresh_token,
                grant_type: 'refresh_token',
                client_id: this.clientId
            });

            const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const response = await axios.post(`${API_BASE_URL}/2/oauth2/token`, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authHeader}`
                }
            });

            const tokenWithExpiry = {
                ...response.data,
                expires_at: Date.now() + (response.data.expires_in * 1000)
            };

            await storeTokenByProjectID('x_token', tokenWithExpiry, this.projectId);
            console.log('X token refreshed successfully');

            return { accessToken: tokenWithExpiry.access_token };
        } catch (err) {
            console.error('Error refreshing token:', err.response?.data || err.message);
            throw err;
        }
    }

    async _getAccessToken() {
        const auth = await this.authorize();

        if (auth.authUrl) {
            throw new Error('Authentication required');
        }

        return auth.accessToken;
    }

    async _getCredentials(projectId = this.projectId) {
        const tokenData = await retrieveTokenByProjectID('x_token', projectId);
        return {
            accessToken: tokenData.access_token
        };
    }

    generateAuthUrl() {
        return this.authorize();
    }

    async uploadVideo(videoFile, options = {}) {
        console.log('Starting X (Twitter) video upload process...');

        try {
            const accessToken = await this._getAccessToken();

            console.log('Video file:', videoFile.path);

            const mediaId = await this._initializeUpload(videoFile, accessToken);

            await this._uploadVideoChunks(videoFile, mediaId, accessToken);
            await this._finalizeUpload(mediaId, accessToken);
            await this._checkUploadStatus(mediaId, accessToken);

            const tweet = await this._createTweetWithMedia(mediaId, options, accessToken);

            return tweet;
        } catch (err) {
            console.error('Error during X video upload:', err.response?.data || err.message);
            throw err;
        }
    }

    async _initializeUpload(videoFile, accessToken) {
        console.log('Initializing video upload...');

        const stats = await fs.stat(videoFile.path);
        const totalBytes = stats.size;
        const mediaType = 'video/mp4';
        const mediaCategory = 'tweet_video';

        const params = new URLSearchParams({
            command: 'INIT',
            total_bytes: totalBytes.toString(),
            media_type: mediaType,
            media_category: mediaCategory
        });

        try {
            const response = await axios.post(
                `${UPLOAD_BASE_URL}/1.1/media/upload.json`,
                params.toString(),
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log('Upload initialized, media_id:', response.data.media_id_string);
            return response.data.media_id_string;
        } catch (error) {
            console.error('Error initializing upload:', error.response?.data || error.message);
            throw error;
        }
    }

    async _uploadVideoChunks(videoFile, mediaId, accessToken) {
        console.log('Uploading video chunks...');

        const chunkSize = 5 * 1024 * 1024;
        const fileBuffer = await fs.readFile(videoFile.path);
        const totalBytes = fileBuffer.length;
        const totalChunks = Math.ceil(totalBytes / chunkSize);

        console.log(`Uploading ${totalChunks} chunk(s) of ${chunkSize} bytes each`);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, totalBytes);
            const chunk = fileBuffer.slice(start, end);

            const formData = new FormData();
            formData.append('command', 'APPEND');
            formData.append('media_id', mediaId);
            formData.append('media', chunk, {
                filename: 'chunk',
                contentType: 'application/octet-stream'
            });
            formData.append('segment_index', i.toString());

            console.log(`Uploading chunk ${i + 1}/${totalChunks}: bytes ${start}-${end}/${totalBytes}`);

            try {
                await axios.post(
                    `${UPLOAD_BASE_URL}/1.1/media/upload.json`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );
                console.log(`Chunk ${i + 1} uploaded successfully`);
            } catch (error) {
                console.error(`Error uploading chunk ${i + 1}:`, error.response?.data || error.message);
                throw error;
            }
        }

        console.log('All chunks uploaded successfully');
    }

    async _finalizeUpload(mediaId, accessToken) {
        console.log('Finalizing upload...');

        const params = new URLSearchParams({
            command: 'FINALIZE',
            media_id: mediaId
        });

        try {
            const response = await axios.post(
                `${UPLOAD_BASE_URL}/1.1/media/upload.json`,
                params.toString(),
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log('Upload finalized:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error finalizing upload:', error.response?.data || error.message);
            throw error;
        }
    }

    async _checkUploadStatus(mediaId, accessToken, maxAttempts = 30) {
        console.log('Checking upload processing status...');

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const params = new URLSearchParams({
                command: 'STATUS',
                media_id: mediaId
            });

            try {
                const response = await axios.get(
                    `${UPLOAD_BASE_URL}/1.1/media/upload.json`,
                    {
                        params: params,
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );

                const status = response.data.processing_info;

                if (!status) {
                    console.log('Video processing complete');
                    return;
                }

                console.log(`Processing status: ${status.state} (${status.progress_percent || 0}%)`);

                if (status.state === 'succeeded') {
                    console.log('Video processing succeeded');
                    return;
                } else if (status.state === 'failed') {
                    throw new Error('Video processing failed');
                }

                const checkAfterSecs = status.check_after_secs || 5;
                await new Promise(resolve => setTimeout(resolve, checkAfterSecs * 1000));
            } catch (error) {
                console.error('Error checking upload status:', error.response?.data || error.message);
                throw error;
            }
        }

        throw new Error('Video processing timeout');
    }

    async _createTweetWithMedia(mediaId, options, accessToken) {
        console.log('Creating tweet with media...');

        const tweetData = {
            text: options.text || options.caption || 'Check out this video!',
            media: {
                media_ids: [mediaId]
            }
        };

        try {
            const response = await axios.post(
                `${API_BASE_URL}/2/tweets`,
                tweetData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Tweet created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating tweet:', error.response?.data || error.message);
            throw error;
        }
    }

    async getUserInfo() {
        try {
            const accessToken = await this._getAccessToken();

            const response = await axios.get(
                `${API_BASE_URL}/2/users/me`,
                {
                    params: {
                        'user.fields': 'id,name,username,created_at,description,profile_image_url,public_metrics,verified'
                    },
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            console.log('User info retrieved:', response.data);
            return response.data.data;
        } catch (err) {
            console.error('Error getting X user info:', err.response?.data || err.message);
            throw err;
        }
    }

    async getTweets(options = {}) {
        try {
            console.log('Getting user tweets');
            const accessToken = await this._getAccessToken();
            const userInfo = await this.getUserInfo();
            const userId = userInfo.id;

            const params = {
                'max_results': options.maxResults || 10,
                'tweet.fields': 'id,text,created_at,public_metrics,attachments',
                'media.fields': 'duration_ms,height,width,preview_image_url,type,url,variants,view_count'
            };

            if (options.pagination_token) {
                params.pagination_token = options.pagination_token;
            }

            const response = await axios.get(
                `${API_BASE_URL}/2/users/${userId}/tweets`,
                {
                    params: params,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            return {
                data: response.data.data || [],
                meta: response.data.meta || {},
                includes: response.data.includes || {}
            };
        } catch (err) {
            console.error('Error getting X tweets:', err.response?.data || err.message);
            throw err;
        }
    }

    async getTweetAnalytics(tweetId) {
        try {
            console.log('Getting tweet analytics for:', tweetId);
            const accessToken = await this._getAccessToken();

            const response = await axios.get(
                `${API_BASE_URL}/2/tweets/${tweetId}`,
                {
                    params: {
                        'tweet.fields': 'id,text,created_at,public_metrics,organic_metrics,promoted_metrics',
                        'expansions': 'attachments.media_keys',
                        'media.fields': 'duration_ms,height,width,preview_image_url,type,url,public_metrics,organic_metrics,promoted_metrics'
                    },
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            return response.data;
        } catch (err) {
            console.error('Error getting tweet analytics:', err.response?.data || err.message);
            throw err;
        }
    }

    async getAccountAnalytics(options = {}) {
        try {
            console.log('Getting account analytics');
            const accessToken = await this._getAccessToken();
            const tweets = await this.getTweets({ maxResults: options.maxResults || 10 });

            let totalViews = 0;
            let totalLikes = 0;
            let totalRetweets = 0;
            let totalReplies = 0;
            let totalQuotes = 0;
            let totalBookmarks = 0;

            if (tweets.data && tweets.data.length > 0) {
                tweets.data.forEach(tweet => {
                    if (tweet.public_metrics) {
                        totalViews += tweet.public_metrics.impression_count || 0;
                        totalLikes += tweet.public_metrics.like_count || 0;
                        totalRetweets += tweet.public_metrics.retweet_count || 0;
                        totalReplies += tweet.public_metrics.reply_count || 0;
                        totalQuotes += tweet.public_metrics.quote_count || 0;
                        totalBookmarks += tweet.public_metrics.bookmark_count || 0;
                    }
                });
            }

            return {
                total_impressions: totalViews,
                total_likess: totalLikes,
                total_retweets: totalRetweets,
                total_replies: totalReplies,
                total_quotes: totalQuotes,
                total_bookmarks: totalBookmarks,
                total_engagement: totalLikes + totalRetweets + totalReplies + totalQuotes + totalBookmarks,
                tweet_count: tweets.data?.length || 0,
                tweets: tweets.data || []
            };
        } catch (err) {
            console.error('Error getting account analytics:', err.response?.data || err.message);
            throw err;
        }
    }

    async deleteTweet(tweetId) {
        try {
            console.log('Deleting tweet:', tweetId);
            const accessToken = await this._getAccessToken();

            const response = await axios.delete(
                `${API_BASE_URL}/2/tweets/${tweetId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            console.log('Tweet deleted:', response.data);
            return response.data;
        } catch (err) {
            console.error('Error deleting tweet:', err.response?.data || err.message);
            throw err;
        }
    }
}

export default XManager;
