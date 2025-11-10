import fs from 'fs/promises';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { storeTokenByProjectID, retrieveTokenByProjectID } from '../utils/token_manager.js';
import { storeOAuthState, retrieveOAuthState } from '../utils/oauth_states.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const SCOPES = 'identity read submit edit mysubreddits';
const API_BASE_URL = 'https://oauth.reddit.com';

class RedditManager {
    constructor(options = {}) {
        this.clientId = options.clientId || process.env.REDDIT_CLIENT_ID || '';
        this.clientSecret = options.clientSecret || process.env.REDDIT_CLIENT_SECRET || '';
        this.redirectUri = options.redirectUri || 'https://api.reelmia.com/api/oauth2callback/reddit';// : 'http://localhost:6709/api/oauth2callback/reddit', process.env.MODE === 'prod' ? 
        this.projectId = 2;
        this.scopes = options.scopes || SCOPES;
        this.userAgent = options.userAgent || 'Reelmia/1.0';

        if (!this.clientId || !this.clientSecret) {
            throw new Error('Reddit Client ID and Client Secret must be provided');
        }
    }

    async authorize() {
        try {
            try {
                const token = await retrieveTokenByProjectID('reddit_token', this.projectId);

                if (token.expires_at && Date.now() < token.expires_at) {
                    console.log('Reddit token found, and is still valid');
                    return { accessToken: token.access_token };
                } else {
                    console.log('Reddit token expired, need to refresh or get new one');
                    return await this.refreshAccessToken();
                }
            } catch {
                console.log('No Reddit token found, need to get a new one');
            }

            const state = crypto.randomBytes(16).toString('hex');

            await storeTokenByProjectID('reddit_oauth_state', {
                state: state
            }, this.projectId);

            await storeOAuthState('reddit', this.projectId, state);

            const authUrl = new URL('https://www.reddit.com/api/v1/authorize');
            authUrl.searchParams.append('client_id', this.clientId);
            authUrl.searchParams.append('response_type', 'code');
            authUrl.searchParams.append('state', state);
            authUrl.searchParams.append('redirect_uri', this.redirectUri);
            authUrl.searchParams.append('duration', 'permanent');
            authUrl.searchParams.append('scope', this.scopes);
            //authUrl.searchParams.append('user_agent', this.userAgent); 

            return { authUrl: authUrl.toString() };
        } catch (err) {
            console.error('Error during Reddit authorization:', err);
            throw err;
        }
    }

    async exchangeCodeForToken(code, state) {
        try {
            const oauthState1 = await retrieveOAuthState(state);

            if (!oauthState1) {
                return { redirect: 'to_local' }
            }

            const projectId = oauthState1.project_id;
            const oauthState = await retrieveTokenByProjectID('reddit_oauth_state', projectId);

            if (state !== oauthState.state) {
                throw new Error('State mismatch - possible CSRF attack');
            }

            const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const response = await axios.post(
                'https://www.reddit.com/api/v1/access_token',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.redirectUri
                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${authHeader}`,
                        'User-Agent': this.userAgent
                    }
                }
            );

            const tokenData = response.data;

            const tokenWithExpiry = {
                ...tokenData,
                expires_at: Date.now() + (tokenData.expires_in * 1000)
            };

            await storeTokenByProjectID('reddit_token', tokenWithExpiry, projectId);
            console.log('Reddit token stored successfully');

            return tokenWithExpiry;
        } catch (err) {
            console.error('Error exchanging code for token:', err.response?.data || err.message);
            throw err;
        }
    }

    async refreshAccessToken() {
        try {
            const tokenData = await retrieveTokenByProjectID('reddit_token', this.projectId);

            if (!tokenData.refresh_token) {
                throw new Error('No refresh token available');
            }

            const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const response = await axios.post(
                'https://www.reddit.com/api/v1/access_token',
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: tokenData.refresh_token
                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${authHeader}`,
                        'User-Agent': this.userAgent
                    }
                }
            );

            const tokenWithExpiry = {
                ...response.data,
                refresh_token: tokenData.refresh_token,
                expires_at: Date.now() + (response.data.expires_in * 1000)
            };

            await storeTokenByProjectID('reddit_token', tokenWithExpiry, this.projectId);
            console.log('Reddit token refreshed successfully');

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
        const tokenData = await retrieveTokenByProjectID('reddit_token', projectId);
        return {
            accessToken: tokenData.access_token
        };
    }

    generateAuthUrl() {
        return this.authorize();
    }

    async uploadVideo(videoFile, options = {}) {
        console.log('Starting Reddit video upload process...');

        try {
            const accessToken = await this._getAccessToken();

            if (!options.subreddit) {
                throw new Error('Subreddit is required for Reddit video upload');
            }

            console.log('Video file:', videoFile.path);

            const mediaAsset = await this._uploadVideoToReddit(videoFile, accessToken);
            const post = await this._createVideoPost(mediaAsset, options, accessToken);

            return post;
        } catch (err) {
            console.error('Error during Reddit video upload:', err.response?.data || err.message);
            throw err;
        }
    }

    async _uploadVideoToReddit(videoFile, accessToken) {
        console.log('Uploading video to Reddit media service...');

        try {
            const stats = await fs.stat(videoFile.path);
            //const fileSize = stats.size;

            const leaseResponse = await axios.post(
                `${API_BASE_URL}/api/media/asset.json`,
                {
                    filepath: videoFile.originalname || 'video.mp4',
                    mimetype: 'video/mp4'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': this.userAgent,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const uploadUrl = leaseResponse.data.args.action;
            const mediaId = leaseResponse.data.asset.asset_id;

            console.log('Upload lease obtained, media ID:', mediaId);

            const fileBuffer = await fs.readFile(videoFile.path);
            const formData = new FormData();

            Object.entries(leaseResponse.data.args.fields).forEach(([key, value]) => {
                formData.append(key, value);
            });

            formData.append('file', fileBuffer, {
                filename: videoFile.originalname || 'video.mp4',
                contentType: 'video/mp4'
            });

            await axios.post(uploadUrl, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'User-Agent': this.userAgent
                }
            });

            console.log('Video uploaded successfully');

            await this._waitForVideoProcessing(mediaId, accessToken);

            return {
                mediaId: mediaId,
                websocketUrl: leaseResponse.data.asset.websocket_url
            };
        } catch (error) {
            console.error('Error uploading video to Reddit:', error.response?.data || error.message);
            throw error;
        }
    }

    async _waitForVideoProcessing(mediaId, accessToken, maxAttempts = 30) {
        console.log('Waiting for video processing...');

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/media/asset.json`,
                    {
                        params: {
                            asset_id: mediaId
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'User-Agent': this.userAgent
                        }
                    }
                );

                const status = response.data.status;
                console.log(`Video processing status (attempt ${attempt + 1}/${maxAttempts}):`, status);

                if (status === 'valid') {
                    console.log('Video processing complete');
                    return true;
                } else if (status === 'failed') {
                    throw new Error('Video processing failed');
                }

                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (error) {
                console.error('Error checking video processing status:', error.response?.data || error.message);
                throw error;
            }
        }

        throw new Error('Video processing timeout');
    }

    async _createVideoPost(mediaAsset, options, accessToken) {
        console.log('Creating Reddit post with video...');

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/submit`,
                {
                    sr: options.subreddit,
                    kind: 'videogif',
                    title: options.title || 'Video Post',
                    video_poster_url: mediaAsset.websocketUrl,
                    url: mediaAsset.websocketUrl,
                    nsfw: options.nsfw || false,
                    spoiler: options.spoiler || false,
                    resubmit: true
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': this.userAgent,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Reddit post created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating Reddit post:', error.response?.data || error.message);
            throw error;
        }
    }

    async getUserInfo() {
        try {
            const accessToken = await this._getAccessToken();

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': this.userAgent
                    }
                }
            );

            console.log('User info retrieved:', response.data);
            return response.data;
        } catch (err) {
            console.error('Error getting Reddit user info:', err.response?.data || err.message);
            throw err;
        }
    }

    async getUserPosts(options = {}) {
        try {
            console.log('Getting user posts');
            const accessToken = await this._getAccessToken();
            const userInfo = await this.getUserInfo();
            const username = userInfo.name;

            const params = {
                limit: options.limit || 25,
                sort: options.sort || 'new'
            };

            if (options.after) {
                params.after = options.after;
            }

            const response = await axios.get(
                `${API_BASE_URL}/user/${username}/submitted`,
                {
                    params: params,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': this.userAgent
                    }
                }
            );

            return {
                data: response.data.data.children.map(child => child.data),
                after: response.data.data.after,
                before: response.data.data.before
            };
        } catch (err) {
            console.error('Error getting Reddit posts:', err.response?.data || err.message);
            throw err;
        }
    }

    async getPostAnalytics(postId) {
        try {
            console.log('Getting post analytics for:', postId);
            const accessToken = await this._getAccessToken();
            const cleanPostId = postId.replace('t3_', '');

            const response = await axios.get(
                `${API_BASE_URL}/api/info`,
                {
                    params: {
                        id: `t3_${cleanPostId}`
                    },
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': this.userAgent
                    }
                }
            );

            const postData = response.data.data.children[0]?.data;

            return {
                id: postData.id,
                title: postData.title,
                subreddit: postData.subreddit,
                score: postData.score,
                upvote_ratio: postData.upvote_ratio,
                num_comments: postData.num_comments,
                created_utc: postData.created_utc,
                permalink: postData.permalink
            };
        } catch (err) {
            console.error('Error getting post analytics:', err.response?.data || err.message);
            throw err;
        }
    }

    async getAccountAnalytics(options = {}) {
        try {
            console.log('Getting account analytics');
            const posts = await this.getUserPosts({ limit: options.limit || 25 });

            let totalScore = 0;
            let totalComments = 0;
            let totalUpvotes = 0;

            if (posts.data && posts.data.length > 0) {
                posts.data.forEach(post => {
                    totalScore += post.score || 0;
                    totalComments += post.num_comments || 0;
                    totalUpvotes += Math.round((post.score || 0) * (post.upvote_ratio || 0.5));
                });
            }

            return {
                total_posts: posts.data?.length || 0,
                total_score: totalScore,
                total_comments: totalComments,
                total_upvotes: totalUpvotes,
                posts: posts.data || []
            };
        } catch (err) {
            console.error('Error getting account analytics:', err.response?.data || err.message);
            throw err;
        }
    }

    async deletePost(postId) {
        try {
            console.log('Deleting post:', postId);
            const accessToken = await this._getAccessToken();
            const cleanPostId = postId.replace('t3_', '');

            const response = await axios.post(
                `${API_BASE_URL}/api/del`,
                {
                    id: `t3_${cleanPostId}`
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': this.userAgent,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Post deleted:', response.data);
            return response.data;
        } catch (err) {
            console.error('Error deleting post:', err.response?.data || err.message);
            throw err;
        }
    }

    async getSubreddits() {
        try {
            console.log('Getting user subreddits');
            const accessToken = await this._getAccessToken();

            const response = await axios.get(
                `${API_BASE_URL}/subreddits/mine/subscriber`,
                {
                    params: {
                        limit: 100
                    },
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': this.userAgent
                    }
                }
            );

            return response.data.data.children.map(child => ({
                name: child.data.display_name,
                title: child.data.title,
                subscribers: child.data.subscribers,
                url: child.data.url
            }));
        } catch (err) {
            console.error('Error getting subreddits:', err.response?.data || err.message);
            throw err;
        }
    }
}

export default RedditManager;
