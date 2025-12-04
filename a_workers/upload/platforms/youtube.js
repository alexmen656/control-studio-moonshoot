import { updateJobStatus } from "../utils/updateJobStatus.js";
import { google } from 'googleapis';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export async function uploadToYouTube(token, job) {
    console.log('Starting YouTube video upload...');

    const accessToken = token.sub.access_token;
    const refreshToken = token.sub.refresh_token;

    const videoFile = {
        path: job.videoFilePath,
        title: job.video.title || 'Uploaded via Reelmia.com',
        description: job.video.description || '',
        tags: [],
        categoryId: '22',
        privacyStatus: 'public'
    };

    if (job.video?.tags && Array.isArray(job.video.tags)) {
        videoFile.tags = job.video.tags;
    }

    if (job.video?.categoryId) {
        videoFile.categoryId = job.video.categoryId;
    }

    if (job.video?.privacyStatus) {
        videoFile.privacyStatus = job.video.privacyStatus;
    }

    console.log('Uploading to YouTube with options:', videoFile);

    try {
        const uploadResponse = await uploadVideo(accessToken, refreshToken, videoFile);

        console.log(`✅ Successfully uploaded to YouTube`);

        await updateJobStatus(job.job_id, 'completed', null, {
            platform: job.platform,
            uploaded_at: new Date().toISOString(),
            video_id: job.video_id,
            upload_data: {
                youtube_video_id: uploadResponse.id,
                platform_response: uploadResponse
            }
        });
    } catch (error) {
        console.error('❌ YouTube upload failed:', error.message);
        throw error;
    }
}

async function uploadVideo(accessToken, refreshToken, videoFile) {
    console.log('Starting upload process...');

    /*
    code: 401,
3|uplod_wo |   errors: [
3|uplod_wo |     {
3|uplod_wo |       message: 'Invalid Credentials',
3|uplod_wo |       domain: 'global',
3|uplod_wo |       reason: 'authError',
3|uplod_wo |       location: 'Authorization',
3|uplod_wo |       locationType: 'header'
3|uplod_wo |     }
3|uplod_wo |   ],
3|uplod_wo |   [Symbol(gaxios-gaxios-error)]: '6.7.1'
3|uplod_wo | }
3|uplod_wo | ❌ YouTube upload failed: Invalid Credentials
8*/

    console.log(process.env.YOUTUBE_CLIENT_ID, process.env.YOUTUBE_CLIENT_SECRET, process.env.YOUTUBE_REDIRECT_URI);

    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI
    );


    console.log(accessToken, refreshToken);
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    try {
        console.log('Refreshing access token...');
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        console.log('Access token refreshed successfully');
    } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError.message);
    }

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.videos.insert({
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
            body: fs.createReadStream(videoFile.path),
        },
    });

    console.log('Video uploaded:', response.data);
    return response.data;
}