import dotenv from 'dotenv';
import fs from 'fs/promises';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';
import { retrieveToken } from '../utils/token_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..', '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

export function auth() {
    const appId = process.env.IG_APP_ID;
    const appSecret = process.env.IG_APP_SECRET;
    const redirectUri = 'http://localhost:6709/api/oauth2callback/facebook';

    if (!appId || !appSecret) {
        console.error('Facebook App ID and App Secret must be set in environment variables.');
        process.exit(1);
    }

    const scope = 'pages_show_list, pages_read_engagement, pages_manage_posts, pages_manage_engagement, public_profile';
    let authUrl = 'https://www.facebook.com/v21.0/dialog/oauth';
    authUrl += '?client_id=' + encodeURIComponent(appId);
    authUrl += '&redirect_uri=' + encodeURIComponent(redirectUri);
    authUrl += '&scope=' + encodeURIComponent(scope);

    return { auth_url: authUrl };
}

export function tokenExchange(code) {
    const appId = process.env.IG_APP_ID;
    const appSecret = process.env.IG_APP_SECRET;
    const redirectUri = 'http://localhost:6709/api/oauth2callback/facebook';

    let tokenUrl = 'https://graph.facebook.com/v21.0/oauth/access_token';
    tokenUrl += '?client_id=' + encodeURIComponent(appId);
    tokenUrl += '&redirect_uri=' + encodeURIComponent(redirectUri);
    tokenUrl += '&client_secret=' + encodeURIComponent(appSecret);
    tokenUrl += '&code=' + encodeURIComponent(code);
    return tokenUrl;
}

export async function uploadVideo(videoFile, options = {}) {
    console.log('Starting Facebook Video upload process...');

    try {
        const facebookAccountsData = await retrieveToken(1, 'facebook_accounts');
        const accessToken = facebookAccountsData.data[0].access_token;
        const pageId = facebookAccountsData.data[0].id;

        console.log('Using Facebook Page ID:', pageId);
        console.log('Video file:', videoFile);

        const { uploadSessionId, startOffset } = await initializeUpload(videoFile, accessToken, pageId, options);
        await uploadVideoChunks(videoFile, uploadSessionId, startOffset, accessToken, pageId);
        const publishedVideo = await finishUpload(uploadSessionId, accessToken, pageId, options);

        return publishedVideo;
    } catch (err) {
        console.error('Error during Facebook video upload:', err);
        throw err;
    }
}

async function initializeUpload(videoFile, accessToken, pageId, options) {
    console.log('pageeeeeeid:', pageId);
    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${pageId}/videos`;
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
        console.error('Error initializing upload:', error.response.data || error.message);
        throw error;
    }
}

async function uploadVideoChunks(videoFile, uploadSessionId, startOffset, accessToken, pageId) {
    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${pageId}/videos`;

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

async function finishUpload(uploadSessionId, accessToken, pageId, options) {
    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${pageId}/videos`;

    const params = {
        upload_phase: 'finish',
        upload_session_id: uploadSessionId,
        access_token: accessToken
    };

    if (options.title) {
        params.title = options.title;
    }
    if (options.description) {
        params.description = options.description;
    }
    if (options.published !== undefined) {
        params.published = options.published;
    }
    if (options.scheduledPublishTime) {
        params.scheduled_publish_time = options.scheduledPublishTime;
    }
    if (options.thumbOffset) {
        params.thumb_offset = options.thumbOffset;
    }

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

export async function getPages(accessToken) {
    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/me/accounts`;

    try {
        const response = await axios.get(url, {
            params: {
                access_token: accessToken
            }
        });

        console.log('Pages:', response.data.data);
        return response.data.data;
    } catch (error) {
        console.error('Error getting pages:', error.response.data || error.message);
        throw error;
    }
}

export async function getVideos(limit = 25) {
    const apiVersion = 'v21.0';

    try {
        const facebookAccountsData = await retrieveToken(1, 'facebook_accounts');
        const accessToken = facebookAccountsData.data[0].access_token;
        const pageId = facebookAccountsData.data[0].id;
        const url = `https://graph.facebook.com/${apiVersion}/${pageId}/videos`;

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
        console.error('Error getting videos:', error.response.data || error.message);
        throw error;
    }
}

export async function getPageVideosWithInsights(PROJECT_ID = 2) {
    const apiVersion = 'v21.0';

    try {
        PROJECT_ID = 2;

        console.log('Fetching Facebook page videos for project ID:', PROJECT_ID);
        const facebookAccountsData = await retrieveToken(1, 'facebook_accounts');
        const accessToken = facebookAccountsData.data[0].access_token;
        const pageId = facebookAccountsData.data[0].id;

        console.log('Fetching videos for page:', pageId);

        const url = `https://graph.facebook.com/${apiVersion}/${pageId}/videos`;
        const videoParams = {
            fields: 'id,title,description,created_time,length,permalink_url',
            limit: 25,
            access_token: accessToken
        };

        const videosResponse = await axios.get(url, { params: videoParams });
        console.log('Facebook videos fetched:', videosResponse.data.data?.length || 0, 'videos');

        const videosWithInsights = [];

        for (const video of videosResponse.data.data || []) {
            try {
                const insightsUrl = `https://graph.facebook.com/${apiVersion}/${video.id}/video_insights`;
                const insightsParams = {
                    metric: 'total_video_views,total_video_reactions,total_video_comments,total_video_shares',
                    access_token: accessToken
                };

                try {
                    const insightsResponse = await axios.get(insightsUrl, { params: insightsParams });

                    const insights = {};
                    insightsResponse.data.data?.forEach(metric => {
                        insights[metric.name] = metric.values?.[0]?.value || 0;
                    });

                    videosWithInsights.push({
                        id: video.id,
                        title: video.title || 'Untitled',
                        description: video.description || '',
                        created_time: video.created_time,
                        views: insights.total_video_views || 0,
                        likes: insights.total_video_reactions || 0,
                        comments: insights.total_video_comments || 0,
                        shares: insights.total_video_shares || 0
                    });
                } catch (insightError) {
                    console.warn(`Could not fetch insights for video ${video.id}:`, insightError.message);

                    videosWithInsights.push({
                        id: video.id,
                        title: video.title || 'Untitled',
                        description: video.description || '',
                        created_time: video.created_time,
                        views: 0,
                        likes: 0,
                        comments: 0,
                        shares: 0
                    });
                }
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

export default {
    uploadVideo,
    auth,
    tokenExchange,
    getPages,
    getVideos,
    getPageVideosWithInsights
}