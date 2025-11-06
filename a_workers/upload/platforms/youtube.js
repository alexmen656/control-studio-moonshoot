import { updateJobStatus } from "../utils/updateJobStatus.js";
import { google } from 'googleapis';
import fs from 'fs';

export async function uploadToYouTube(token, job) {
    console.log('Starting YouTube video upload...');

    const accessToken = token.sub.access_token;
    const refreshToken = token.sub.refresh_token;

    const videoFile = {
        path: 'test.mp4',
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
        await uploadVideo(accessToken, refreshToken, videoFile);

        console.log(`✅ Successfully uploaded to YouTube`);

        await updateJobStatus(job.job_id, 'completed', null, {
            platform: job.platform,
            uploaded_at: new Date().toISOString(),
            video_id: job.video_id,
            platform_response: 'Upload successful'
        });
    } catch (error) {
        console.error('❌ YouTube upload failed:', error.message);
        throw error;
    }
}

async function uploadVideo(accessToken, refreshToken, videoFile) {
    console.log('Starting upload process...');

    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

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
                    body: fs.createReadStream(videoFile.path),
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