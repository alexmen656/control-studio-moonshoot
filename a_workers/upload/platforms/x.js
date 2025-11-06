import { updateJobStatus } from "../utils/updateJobStatus.js";
import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';

export async function uploadToX(token, job) {
    console.log('Starting X (Twitter) video upload...');

    const accessToken = token.sub.access_token;

    const videoFile = {
        path: 'test.mp4'
    };

    const options = {
        text: job.video.title || 'Uploaded via Reelmia.com',
        caption: job.video.description || ''
    };

    console.log('Uploading to X with options:', options);

    try {
        await uploadVideo(accessToken, videoFile, options);

        console.log(`✅ Successfully uploaded to X`);

        await updateJobStatus(job.job_id, 'completed', null, {
            platform: job.platform,
            uploaded_at: new Date().toISOString(),
            video_id: job.video_id,
            platform_response: 'Upload successful'
        });
    } catch (error) {
        console.error('❌ X upload failed:', error.message);
        throw error;
    }
}

// Copied over from backend/platforms/X.js
async function uploadVideo(accessToken, videoFile, options) {
    console.log('Starting X (Twitter) video upload process...');

    const API_BASE_URL = 'https://api.x.com';
    const UPLOAD_BASE_URL = 'https://upload.x.com';

    console.log('Video file:', videoFile.path);

    const mediaId = await initializeUpload(videoFile, accessToken, UPLOAD_BASE_URL);
    await uploadVideoChunks(videoFile, mediaId, accessToken, UPLOAD_BASE_URL);
    await finalizeUpload(mediaId, accessToken, UPLOAD_BASE_URL);
    await checkUploadStatus(mediaId, accessToken, UPLOAD_BASE_URL);

    const tweet = await createTweetWithMedia(mediaId, options, accessToken, API_BASE_URL);

    return tweet;
}

async function initializeUpload(videoFile, accessToken, UPLOAD_BASE_URL) {
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
}

async function uploadVideoChunks(videoFile, mediaId, accessToken, UPLOAD_BASE_URL) {
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
    }

    console.log('All chunks uploaded successfully');
}

async function finalizeUpload(mediaId, accessToken, UPLOAD_BASE_URL) {
    console.log('Finalizing upload...');

    const params = new URLSearchParams({
        command: 'FINALIZE',
        media_id: mediaId
    });

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
}

async function checkUploadStatus(mediaId, accessToken, UPLOAD_BASE_URL, maxAttempts = 30) {
    console.log('Checking upload processing status...');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const params = new URLSearchParams({
            command: 'STATUS',
            media_id: mediaId
        });

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
    }

    throw new Error('Video processing timeout');
}

async function createTweetWithMedia(mediaId, options, accessToken, API_BASE_URL) {
    console.log('Creating tweet with media...');

    const tweetData = {
        text: options.text || options.caption || 'Check out this video!',
        media: {
            media_ids: [mediaId]
        }
    };

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
}