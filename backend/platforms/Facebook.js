import dotenv from 'dotenv';
import fs from 'fs/promises';
import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';
import { retrieveTokenByProjectID } from '../utils/token_manager.js';
import { storeOAuthState, retrieveOAuthState } from '../utils/oauth_states.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..', '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const DEFAULT_SCOPES = 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,public_profile';
const API_VERSION = 'v21.0';

class FacebookManager {
    constructor(options = {}) {
        this.appId = options.appId || process.env.IG_APP_ID;
        this.appSecret = options.appSecret || process.env.IG_APP_SECRET;
        this.redirectUri = options.redirectUri || 'http://localhost:6709/api/oauth2callback/facebook';
        this.projectId = 2;//options.projectId || 1;
        this.scopes = options.scopes || DEFAULT_SCOPES;
        this.apiVersion = options.apiVersion || API_VERSION;

        if (!this.appId || !this.appSecret) {
            throw new Error('Facebook App ID and App Secret must be provided');
        }
    }

    async _getCredentials(projectId = this.projectId) {
        const facebookAccountsData = await retrieveTokenByProjectID('facebook_accounts', projectId);

        return {
            accessToken: facebookAccountsData.data[0].access_token,
            pageId: facebookAccountsData.data[0].id
        };
    }

    generateAuthUrl() {
        const state = crypto.randomBytes(16).toString('hex');

        storeOAuthState('facebook', this.projectId, state);

        let authUrl = `https://www.facebook.com/${this.apiVersion}/dialog/oauth`;
        authUrl += '?client_id=' + encodeURIComponent(this.appId);
        authUrl += '&redirect_uri=' + encodeURIComponent(this.redirectUri);
        authUrl += '&scope=' + encodeURIComponent(this.scopes);
        authUrl += '&state=' + encodeURIComponent(state);

        return { auth_url: authUrl };
    }

    getTokenExchangeUrl(code) {
        let tokenUrl = `https://graph.facebook.com/${this.apiVersion}/oauth/access_token`;
        tokenUrl += '?client_id=' + encodeURIComponent(this.appId);
        tokenUrl += '&redirect_uri=' + encodeURIComponent(this.redirectUri);
        tokenUrl += '&client_secret=' + encodeURIComponent(this.appSecret);
        tokenUrl += '&code=' + encodeURIComponent(code);
        return tokenUrl;
    }

    async uploadVideo(videoFile, options = {}) {
        console.log('Starting Facebook Video upload process...');

        try {
            const { accessToken, pageId } = await this._getCredentials(this.projectId);

            console.log('Using Facebook Page ID:', pageId);
            console.log('Video file:', videoFile);

            const { uploadSessionId, startOffset } = await this._initializeUpload(videoFile, accessToken, pageId, options);
            await this._uploadVideoChunks(videoFile, uploadSessionId, startOffset, accessToken, pageId);
            const publishedVideo = await this._finishUpload(uploadSessionId, accessToken, pageId, options);

            return publishedVideo;
        } catch (err) {
            console.error('Error during Facebook video upload:', err);
            throw err;
        }
    }

    async _initializeUpload(videoFile, accessToken, pageId, options) {
        console.log('Initializing upload for page ID:', pageId);
        const url = `https://graph.facebook.com/${this.apiVersion}/${pageId}/videos`;
        const stats = await fs.stat(videoFile.path);
        const fileSize = stats.size;

        const params = {
            upload_phase: 'start',
            file_size: fileSize,
            access_token: accessToken
        };

        try {
            const response = await axios.post(url, null, { params });
            console.log('Upload session created:', response.data.upload_session_id, 'Start Offset:', response.data.start_offset, 'End Offset:', response.data.end_offset);
            return {
                uploadSessionId: response.data.upload_session_id,
                startOffset: response.data.start_offset
            };
        } catch (error) {
            console.error('Error initializing upload:', error.response?.data || error.message);
            throw error;
        }
    }

    async _uploadVideoChunks(videoFile, uploadSessionId, startOffset, accessToken, pageId) {
        const url = `https://graph.facebook.com/${this.apiVersion}/${pageId}/videos`;

        try {
            console.log('Uploading video chunk at offset:', startOffset);
            const fileBuffer = await fs.readFile(videoFile.path);

            const formData = new FormData();
            formData.append('upload_phase', 'transfer');
            formData.append('upload_session_id', uploadSessionId);
            formData.append('start_offset', startOffset);
            formData.append('access_token', accessToken);
            formData.append('video_file_chunk', fileBuffer, {
                filename: 'video.mp4',
                contentType: 'video/mp4'
            });

            const response = await axios.post(url, formData, {
                headers: formData.getHeaders()
            });

            console.log('Video chunk uploaded successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error uploading video chunk:');

            if (error.response?.data) {
                console.error(JSON.stringify(error.response.data, null, 2));
            } else {
                console.error(error.message);
            }

            throw error;
        }
    }

    async _finishUpload(uploadSessionId, accessToken, pageId, options) {
        const url = `https://graph.facebook.com/${this.apiVersion}/${pageId}/videos`;

        const params = {
            upload_phase: 'finish',
            upload_session_id: uploadSessionId,
            access_token: accessToken
        };

        if (options.title) params.title = options.title;
        if (options.description) params.description = options.description;
        if (options.published !== undefined) params.published = options.published;
        if (options.scheduledPublishTime) params.scheduled_publish_time = options.scheduledPublishTime;
        if (options.thumbOffset) params.thumb_offset = options.thumbOffset;

        try {
            const response = await axios.post(url, null, { params });
            console.log('Video published successfully with ID:', response.data.id);
            return response.data;
        } catch (error) {
            if (error.response?.data) {
                console.error(JSON.stringify(error.response.data, null, 2));
            } else {
                console.error(error.message);
            }
            throw error;
        }
    }

    async getPages(accessToken) {
        const url = `https://graph.facebook.com/${this.apiVersion}/me/accounts`;

        try {
            const response = await axios.get(url, {
                params: {
                    access_token: accessToken
                }
            });

            console.log('Pages:', response.data.data);
            return response.data.data;
        } catch (error) {
            console.error('Error getting pages:', error.response?.data || error.message);
            throw error;
        }
    }

    async getVideos(projectId = this.projectId, limit = 25) {
        try {
            const { accessToken, pageId } = await this._getCredentials(projectId);
            const url = `https://graph.facebook.com/${this.apiVersion}/${pageId}/videos`;

            const response = await axios.get(url, {
                params: {
                    fields: 'id,title,description,created_time,length,permalink_url',
                    limit: limit,
                    access_token: accessToken
                }
            });

            console.log('Videos:', response.data.data);
            return response.data.data;
        } catch (error) {
            console.error('Error getting videos:', error.response?.data || error.message);
            throw error;
        }
    }

    async getPageVideosWithInsights(projectId = this.projectId, limit = 25) {
        try {
            console.log('Fetching Facebook page videos for project ID:', projectId);
            const { accessToken, pageId } = await this._getCredentials(projectId);

            console.log('Fetching videos for page:', pageId);

            const url = `https://graph.facebook.com/${this.apiVersion}/${pageId}/videos`;
            const videoParams = {
                fields: 'id,title,description,created_time,length,permalink_url',
                limit: limit,
                access_token: accessToken
            };

            const videosResponse = await axios.get(url, { params: videoParams });
            console.log('Facebook videos fetched:', videosResponse.data.data?.length || 0, 'videos');

            const videosWithInsights = [];

            for (const video of videosResponse.data.data || []) {
                try {
                    const insights = await this._getVideoInsights(video.id, accessToken);

                    videosWithInsights.push({
                        id: video.id,
                        title: video.title || 'Untitled',
                        description: video.description || '',
                        created_time: video.created_time,
                        ...insights
                    });
                } catch (error) {
                    console.warn(`Error processing video ${video.id}:`, error.message);
                }
            }

            return {
                data: {
                    videos: videosWithInsights
                },
                status: 200
            };
        } catch (error) {
            console.error('Error getting Facebook page videos:', error);
            throw error;
        }
    }

    async _getVideoInsights(videoId, accessToken) {
        const insightsUrl = `https://graph.facebook.com/${this.apiVersion}/${videoId}/video_insights`;
        const insightsParams = {
            metric: 'total_video_views,total_video_reactions,total_video_comments,total_video_shares',
            access_token: accessToken
        };

        try {
            const insightsResponse = await axios.get(insightsUrl, { params: insightsParams });

            const insights = {
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0
            };

            insightsResponse.data.data?.forEach(metric => {
                const value = metric.values?.[0]?.value || 0;
                switch (metric.name) {
                    case 'total_video_views':
                        insights.views = value;
                        break;
                    case 'total_video_reactions':
                        insights.likes = value;
                        break;
                    case 'total_video_comments':
                        insights.comments = value;
                        break;
                    case 'total_video_shares':
                        insights.shares = value;
                        break;
                }
            });

            return insights;
        } catch (insightError) {
            console.warn(`Could not fetch insights for video ${videoId}:`, insightError.message);
            return {
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0
            };
        }
    }

    async getPageInfo(projectId = this.projectId) {
        const { accessToken, pageId } = await this._getCredentials(projectId);
        const url = `https://graph.facebook.com/${this.apiVersion}/${pageId}`;

        const response = await axios.get(url, {
            params: {
                fields: 'name,username,fan_count,followers_count,picture',
                access_token: accessToken
            }
        });

        return response.data;
    }
}

export default FacebookManager;