import dotenv from 'dotenv';
import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { retrieveToken, retrieveTokenByProjectID } from '../utils/token_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..', '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const DEFAULT_SCOPES = 'instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list,business_management,instagram_manage_insights';
const API_VERSION = 'v21.0';

class InstagramManager {
    constructor(options = {}) {
        this.appId = options.appId || process.env.IG_APP_ID;
        this.appSecret = options.appSecret || process.env.IG_APP_SECRET;
        this.redirectUri = options.redirectUri || 'http://localhost:6709/api/oauth2callback/instagram';
        this.projectId = options.projectId || 1;
        this.scopes = options.scopes || DEFAULT_SCOPES;
        this.apiVersion = options.apiVersion || API_VERSION;

        if (!this.appId || !this.appSecret) {
            throw new Error('Instagram App ID and App Secret must be provided');
        }
    }

    async _getCredentials(projectId = this.projectId) {
        const instagramAccountData = await retrieveTokenByProjectID(1, 'instagram_business_account', projectId);
        const tokenData = await retrieveTokenByProjectID(1, 'instagram_token', projectId);

        return {
            instagramUserId: instagramAccountData.instagram_business_account.id,
            accessToken: tokenData.access_token
        };
    }

    generateAuthUrl() {
        let authUrl = `https://www.facebook.com/v14.0/dialog/oauth`;
        authUrl += '?client_id=' + encodeURIComponent(this.appId);
        authUrl += '&redirect_uri=' + encodeURIComponent(this.redirectUri);
        authUrl += '&scope=' + encodeURIComponent(this.scopes);

        return { auth_url: authUrl };
    }

    getTokenExchangeUrl(code) {
        let tokenUrl = `https://graph.facebook.com/v14.0/oauth/access_token`;
        tokenUrl += '?client_id=' + encodeURIComponent(this.appId);
        tokenUrl += '&redirect_uri=' + encodeURIComponent(this.redirectUri);
        tokenUrl += '&client_secret=' + encodeURIComponent(this.appSecret);
        tokenUrl += '&code=' + encodeURIComponent(code);
        return tokenUrl;
    }

    async uploadReel(videoFile, options = {}) {
        console.log('Starting Instagram Reel upload process...');

        try {
            const instagramAccountData = await retrieveToken(this.projectId, 'instagram_business_account');
            const facebookAccountsData = await retrieveToken(this.projectId, 'facebook_accounts_for_instagram');
            const instagramUserId = instagramAccountData.instagram_business_account.id;
            const accessToken = facebookAccountsData.data[0].access_token;

            console.log('Using Instagram Business Account ID:', instagramUserId);

            const containerId = await this._createReelContainer(accessToken, instagramUserId, options);
            await this._uploadVideoToContainer(videoFile, containerId, accessToken);
            await this._waitForContainerReady(containerId, accessToken);

            const publishedReel = await this._publishContainer(containerId, accessToken, instagramUserId);
            return publishedReel;
        } catch (err) {
            console.error('Error during Instagram reel upload:', err);
            throw err;
        }
    }

    async _createReelContainer(accessToken, instagramUserId, options) {
        const url = `https://graph.facebook.com/${this.apiVersion}/${instagramUserId}/media`;

        const params = {
            media_type: 'REELS',
            upload_type: 'resumable',
            access_token: accessToken
        };

        if (options.caption) params.caption = options.caption;
        if (options.locationId) params.location_id = options.locationId;
        if (options.shareToFeed !== undefined) params.share_to_feed = options.shareToFeed;
        if (options.coverUrl) params.cover_url = options.coverUrl;
        if (options.audioName) params.audio_name = options.audioName;

        try {
            const response = await axios.post(url, null, { params });
            console.log('Container created:', response.data.id);
            return response.data.id;
        } catch (error) {
            console.error('Error creating container:', error.response?.data || error.message);
            throw error;
        }
    }

    async _uploadVideoToContainer(videoFile, containerId, accessToken) {
        const url = `https://rupload.facebook.com/ig-api-upload/${this.apiVersion}/${containerId}`;

        try {
            const stats = await fs.stat(videoFile.path);
            const fileSize = stats.size;
            const fileBuffer = await fs.readFile(videoFile.path);

            const response = await axios.post(url, fileBuffer, {
                headers: {
                    'Authorization': `OAuth ${accessToken}`,
                    'offset': '0',
                    'file_size': fileSize.toString(),
                    'Content-Type': 'application/octet-stream'
                }
            });

            console.log('Video uploaded successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error uploading video:', error.response?.data || error.message);
            throw error;
        }
    }

    async _waitForContainerReady(containerId, accessToken, maxAttempts = 10) {
        const url = `https://graph.facebook.com/${this.apiVersion}/${containerId}`;

        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await axios.get(url, {
                    params: {
                        fields: 'status_code,status',
                        access_token: accessToken
                    }
                });

                const status = response.data.status_code;
                console.log(`Container status (attempt ${i + 1}/${maxAttempts}):`, status);

                if (status === 'FINISHED') {
                    console.log('Container is ready for publishing');
                    return true;
                } else if (status === 'ERROR') {
                    throw new Error('Container processing failed with ERROR status');
                } else if (status === 'EXPIRED') {
                    throw new Error('Container expired before processing completed');
                }

                await new Promise(resolve => setTimeout(resolve, 10000));
            } catch (error) {
                console.error('Error checking container status:', error.response?.data || error.message);
                throw error;
            }
        }

        throw new Error('Container did not become ready within expected time');
    }

    async _publishContainer(containerId, accessToken, instagramUserId) {
        const url = `https://graph.facebook.com/${this.apiVersion}/${instagramUserId}/media_publish`;

        try {
            const response = await axios.post(url, null, {
                params: {
                    creation_id: containerId,
                    access_token: accessToken
                }
            });

            console.log('Reel published with ID:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('Error publishing container:', error.response?.data || error.message);
            throw error;
        }
    }

    async checkPublishingLimit(projectId = this.projectId) {
        try {
            const { instagramUserId, accessToken } = await this._getCredentials(projectId);
            const url = `https://graph.facebook.com/${this.apiVersion}/${instagramUserId}/content_publishing_limit`;

            const response = await axios.get(url, {
                params: {
                    fields: 'quota_usage,config',
                    access_token: accessToken
                }
            });

            console.log('Publishing limit info:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error checking publishing limit:', error.response?.data || error.message);
            throw error;
        }
    }

    async getTotalAnalytics(projectId = this.projectId, metric = 'reach', period = 'day') {
        const { instagramUserId, accessToken } = await this._getCredentials(projectId);

        console.log('--------------------------------------------------------');
        console.log('Instagram User ID for analytics:', instagramUserId);

        const url = `https://graph.facebook.com/${this.apiVersion}/${instagramUserId}/insights`;

        const params = {
            metric: metric,
            period: period,
            access_token: accessToken
        };

        const response = await axios.get(url, { params });

        console.log('Total analytics data:', response.data);
        console.log('Total analytics values:', response.data.data?.values);

        return response.data;
    }

    async getUserMedia(projectId = this.projectId, limit = 25) {
        try {
            console.log('Fetching Instagram user media for project ID:', projectId);
            const { instagramUserId, accessToken } = await this._getCredentials(projectId);

            console.log('Fetching Instagram media for user:', instagramUserId);

            const mediaUrl = `https://graph.facebook.com/${this.apiVersion}/${instagramUserId}/media`;
            const mediaParams = {
                fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
                access_token: accessToken,
                limit: limit
            };

            const mediaResponse = await axios.get(mediaUrl, { params: mediaParams });

            console.log('Instagram media fetched:', mediaResponse.data.data?.length || 0, 'posts');

            const mediaWithInsights = [];

            for (const media of mediaResponse.data.data || []) {
                try {
                    if (['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(media.media_type)) {
                        const insights = await this._getMediaInsights(media.id, accessToken);

                        mediaWithInsights.push({
                            id: media.id,
                            caption: media.caption || '',
                            media_type: media.media_type,
                            timestamp: media.timestamp,
                            likes: media.like_count || 0,
                            comments: media.comments_count || 0,
                            ...insights
                        });
                    }
                } catch (error) {
                    console.warn(`Error processing media ${media.id}:`, error.message);
                }
            }

            return {
                data: {
                    media: mediaWithInsights
                },
                status: 200
            };
        } catch (error) {
            console.error('Error getting Instagram user media:', error);
            throw error;
        }
    }

    async _getMediaInsights(mediaId, accessToken) {
        const insightsUrl = `https://graph.facebook.com/${this.apiVersion}/${mediaId}/insights`;
        const insightsParams = {
            metric: 'impressions,reach,engagement,saved,video_views,shares',
            access_token: accessToken
        };

        try {
            const insightsResponse = await axios.get(insightsUrl, { params: insightsParams });

            const insights = {
                impressions: 0,
                reach: 0,
                engagement: 0,
                saved: 0,
                video_views: 0,
                shares: 0
            };

            insightsResponse.data.data?.forEach(metric => {
                insights[metric.name] = metric.values?.[0]?.value || 0;
            });

            return insights;
        } catch (insightError) {
            console.warn(`Could not fetch insights for media ${mediaId}:`, insightError.message);
            return {
                impressions: 0,
                reach: 0,
                engagement: 0,
                saved: 0,
                video_views: 0,
                shares: 0
            };
        }
    }

    async getAccountInfo(projectId = this.projectId) {
        const { instagramUserId, accessToken } = await this._getCredentials(projectId);
        const url = `https://graph.facebook.com/${this.apiVersion}/${instagramUserId}`;

        const response = await axios.get(url, {
            params: {
                fields: 'username,name,profile_picture_url,followers_count,follows_count,media_count',
                access_token: accessToken
            }
        });

        return response.data;
    }
}

export default InstagramManager;