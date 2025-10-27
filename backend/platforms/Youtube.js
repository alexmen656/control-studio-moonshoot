import fs from 'fs/promises';
import { google } from 'googleapis';
import fs2 from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { storeTokenByProjectID, retrieveTokenByProjectID } from '../utils/token_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/yt-analytics.readonly', 'https://www.googleapis.com/auth/youtube.readonly'];

async function uploadVideo(videoFile) {
    console.log('Starting upload process...');
    try {
        const auth = await authorize();

        if (auth.authUrl) {
            console.log('Authentication required. Visit:', auth.authUrl);
            return { authUrl: auth.authUrl };
        }

        console.log('Credentials loaded, uploading video...');
        return await uploadToYouTube(auth, videoFile);
    } catch (err) {
        console.error('Error during upload process:', err);
        throw err;
    }
}

async function authorize(PROJECT_ID = 1) {
    try {
        const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
        const { client_secret, client_id, redirect_uris } = JSON.parse(content);
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:6709/api/oauth2callback/youtube');

        try {
            const token = await retrieveTokenByProjectID(1, 'youtube_token', PROJECT_ID);
            const tokenData = token;

            if (!tokenData.refresh_token) {
                const authUrl = oAuth2Client.generateAuthUrl({
                    access_type: 'offline',
                    prompt: 'consent',
                    scope: SCOPES,
                });
                return { authUrl };
            }

            oAuth2Client.setCredentials(tokenData);
            return oAuth2Client;
        } catch {
            console.log('No token found, need to get a new one');
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: SCOPES,
            });
            return { authUrl };
        }
    } catch (err) {
        console.error('Error loading credentials.json:', err);
        throw err;
    }
}

async function getTokenFromCode(code, PROJECT_ID = 1) {
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
    const { client_secret, client_id, redirect_uris } = JSON.parse(content);
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:6709/api/oauth2callback/youtube');

    const tokenResponse = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokenResponse.tokens);

    await storeTokenByProjectID(1, 'youtube_token', tokenResponse.tokens, PROJECT_ID);
}

async function uploadToYouTube(auth, videoFile) {
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
                        privacyStatus: 'public',
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

async function getAnalytics() {//PROJECT_ID = 2
    const auth = await authorize(2);

    if (auth.authUrl) {
        console.log('Authentication required. Visit:', auth.authUrl);
        return { authUrl: auth.authUrl };
    }

    console.log('YouTube analytics retrieval...');

    var service = google.youtube('v3');
    service.channels.list({
        auth: auth,
        part: 'snippet,contentDetails,statistics',
        forUsername: 'blackshark3998'
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }

        console.log('Analytics response:', response.data);

        var channels = response.data.items;
        if (channels.length == 0) {
            console.log('No channel found.');
        } else {
            console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                'it has %s views.',
                channels[0].id,
                channels[0].snippet.title,
                channels[0].statistics.viewCount);
        }
    });
}

getAnalytics();

export default {
    uploadVideo,
    authorize,
    getTokenFromCode,
    getAnalytics
}