import dotenv from 'dotenv';
import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { retrieveToken, retrieveTokenByProjectID } from '../utils/token_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..', '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

function auth() {
    const appId = process.env.IG_APP_ID;
    const appSecret = process.env.IG_APP_SECRET;
    const redirectUri = 'http://localhost:6709/api/oauth2callback/instagram';

    if (!appId || !appSecret) {
        console.error('Instagram App ID and App Secret must be set in environment variables.');
        process.exit(1);
    }

    const scope = 'instagram_basic,instagram_content_publish,pages_read_engagement, pages_show_list, business_management, instagram_manage_insights';//instagram_manage_insights
    let authUrl = 'https://www.facebook.com/v14.0/dialog/oauth';
    authUrl += '?client_id=' + encodeURIComponent(appId);
    authUrl += '&redirect_uri=' + encodeURIComponent(redirectUri);
    authUrl += '&scope=' + encodeURIComponent(scope);

    return { auth_url: authUrl };
}

function tokenExchange(code) {
    const appId = process.env.IG_APP_ID;
    const appSecret = process.env.IG_APP_SECRET;
    const redirectUri = 'http://localhost:6709/api/oauth2callback/instagram';

    let tokenUrl = 'https://graph.facebook.com/v14.0/oauth/access_token';
    tokenUrl += '?client_id=' + encodeURIComponent(appId);
    tokenUrl += '&redirect_uri=' + encodeURIComponent(redirectUri);
    tokenUrl += '&client_secret=' + encodeURIComponent(appSecret);
    tokenUrl += '&code=' + encodeURIComponent(code);
    return tokenUrl;
}

async function uploadReel(videoFile, options = {}) {
    console.log('Starting Instagram Reel upload process...');

    try {
        const instagramAccountData = await retrieveToken(1, 'instagram_business_account');
        const facebookAccountsData = await retrieveToken(1, 'facebook_accounts_for_instagram');
        const instagramUserId = instagramAccountData.instagram_business_account.id;
        const accessToken = facebookAccountsData.data[0].access_token;
        const containerId = await createReelContainer(accessToken, instagramUserId, options);
        console.log('Using Instagram Business Account ID:', instagramUserId);

        await uploadVideoToContainer(videoFile, containerId, accessToken);
        await waitForContainerReady(containerId, accessToken);

        const publishedReel = await publishContainer(containerId, accessToken, instagramUserId);
        return publishedReel;
    } catch (err) {
        console.error('Error during Instagram reel upload:', err);
        throw err;
    }
}

async function createReelContainer(accessToken, instagramUserId, options) {
    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${instagramUserId}/media`;

    const params = {
        media_type: 'REELS',
        upload_type: 'resumable',
        access_token: accessToken
    };

    if (options.caption) {
        params.caption = options.caption;
    }
    if (options.locationId) {
        params.location_id = options.locationId;
    }
    if (options.shareToFeed !== undefined) {
        params.share_to_feed = options.shareToFeed;
    }
    if (options.coverUrl) {
        params.cover_url = options.coverUrl;
    }
    if (options.audioName) {
        params.audio_name = options.audioName;
    }

    try {
        const response = await axios.post(url, null, { params });
        console.log('Container created:', response.data.id);
        return response.data.id;
    } catch (error) {
        console.error('Error creating container:', error.response?.data || error.message);
        throw error;
    }
}

async function uploadVideoToContainer(videoFile, containerId, accessToken) {
    const apiVersion = 'v21.0';
    const url = `https://rupload.facebook.com/ig-api-upload/${apiVersion}/${containerId}`;

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

async function waitForContainerReady(containerId, accessToken, maxAttempts = 10) {
    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${containerId}`;

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

async function publishContainer(containerId, accessToken, instagramUserId) {
    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${instagramUserId}/media_publish`;

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

async function checkPublishingLimit() {
    const apiVersion = 'v21.0';

    try {
        const instagramAccountData = await retrieveToken(1, 'instagram_business_account');
        const facebookAccountsData = await retrieveToken(1, 'facebook_accounts_for_instagram');
        const instagramUserId = instagramAccountData.instagram_business_account.id;
        const accessToken = facebookAccountsData.data[0].access_token;
        const url = `https://graph.facebook.com/${apiVersion}/${instagramUserId}/content_publishing_limit`;

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

async function getTotalAnalytics() {
    const instagramAccountData = await retrieveTokenByProjectID(1, 'instagram_business_account', 2);
    const facebookAccountsData = await retrieveTokenByProjectID(1, 'instagram_token', 2); //await retrieveTokenByProjectID(1, 'facebook_accounts_for_instagram', 2);
    //facebook_accounts_for_instagram == wrong token
    const instagramUserId = instagramAccountData.instagram_business_account.id;
    const accessToken = facebookAccountsData.access_token;

    console.log("--------------------------------------------------------")
    console.log('Instagram User ID for analytics:', instagramUserId);
    console.log('Access Token for analytics:', accessToken);
    let url = 'https://graph.facebook.com/v21.0/' + instagramUserId + '/insights';

    const params = {
        metric: 'reach',//'reach, follower_count, website_clicks, profile_views, online_followers, accounts_engaged, total_interactions, likes, comments, shares, saves, replies, engaged_audience_demographics, reached_audience_demographics, follower_demographics, follows_and_unfollows, profile_links_taps, views, threads_likes, threads_replies, reposts, quotes, threads_followers, threads_follower_demographics, content_views, threads_views, threads_clicks', //'impressions,reach,profile_views',
        period: 'day',
        access_token: accessToken
    };

    const response = await axios.get(url, {
        params
    });

    console.log('Total analytics data:', response.data);
    console.log('Total analytics data:', response.data.data.values);

    //response.data.data.values.forEach(entry => {
    //  console.log(`Date: ${entry.end_time}, Value: ${entry.value}`);
    //});

    return response.data;

    return 'hello'
}

//getTotalAnalytics();
export default {
    checkPublishingLimit,
    uploadReel,
    auth,
    tokenExchange
}