import { updateJobStatus } from "../utils/updateJobStatus.js";
import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';

export async function uploadToReddit(token, job) {
    console.log('Starting Reddit video upload...');

    const accessToken = token.sub.access_token;

    const videoFile = {
        path: 'test.mp4',
        originalname: 'video.mp4'
    };

    const options = {
        title: job.video.title || 'Uploaded via Reelmia.com',
        subreddit: 'test',
        nsfw: false,
        spoiler: false
    };

    if (job.video?.subreddit && job.video.subreddit.trim() !== '') {
        options.subreddit = job.video.subreddit;
    }
    if (job.video?.nsfw !== undefined && job.video.nsfw !== null) {
        options.nsfw = job.video.nsfw;
    }

    if (job.video?.spoiler !== undefined && job.video.spoiler !== null) {
        options.spoiler = job.video.spoiler;
    }

    if (job.video?.flairId && job.video.flairId.trim() !== '') {
        options.flairId = job.video.flairId;
    }

    if (job.video?.flairText && job.video.flairText.trim() !== '') {
        options.flairText = job.video.flairText;
    }

    console.log('Uploading to Reddit with options:', options);

    try {
        const uploadResponse = await uploadVideo(accessToken, videoFile, options);

        console.log(`✅ Successfully uploaded to Reddit`);

        await updateJobStatus(job.job_id, 'completed', null, {
            platform: job.platform,
            uploaded_at: new Date().toISOString(),
            video_id: job.video_id,
            upload_data: {
                reddit_submission_id: uploadResponse.json?.data?.id,
                reddit_submission_url: uploadResponse.json?.data?.url,
                platform_response: uploadResponse
            }
        });
    } catch (error) {
        console.error('❌ Reddit upload failed:', error.message);
        throw error;
    }
}

async function uploadVideo(accessToken, videoFile, options) {
    console.log('Starting Reddit video upload process...');

    const API_BASE_URL = 'https://oauth.reddit.com';
    const userAgent = 'Reelmia/1.0';

    if (!options.subreddit) {
        throw new Error('Subreddit is required for Reddit video upload');
    }

    console.log('Video file:', videoFile.path);

    const mediaAsset = await uploadVideoToReddit(videoFile, accessToken, userAgent, API_BASE_URL);
    const post = await createVideoPost(mediaAsset, options, accessToken, userAgent, API_BASE_URL);

    return post;
}

async function uploadVideoToReddit(videoFile, accessToken, userAgent, API_BASE_URL) {
    console.log('Uploading video to Reddit media service...');

    const leaseResponse = await axios.post(
        `${API_BASE_URL}/api/media/asset.json`,
        {
            filepath: videoFile.originalname || 'video.mp4',
            mimetype: 'video/mp4'
        },
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': userAgent,
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
            'User-Agent': userAgent
        }
    });

    console.log('Video uploaded successfully');

    await waitForVideoProcessing(mediaId, accessToken, userAgent, API_BASE_URL);

    return {
        mediaId: mediaId,
        websocketUrl: leaseResponse.data.asset.websocket_url
    };
}

async function waitForVideoProcessing(mediaId, accessToken, userAgent, API_BASE_URL, maxAttempts = 30) {
    console.log('Waiting for video processing...');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await axios.get(
            `${API_BASE_URL}/api/media/asset.json`,
            {
                params: {
                    asset_id: mediaId
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': userAgent
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
    }

    throw new Error('Video processing timeout');
}

async function createVideoPost(mediaAsset, options, accessToken, userAgent, API_BASE_URL) {
    console.log('Creating Reddit post with video...');

    const postData = {
        sr: options.subreddit,
        kind: 'videogif',
        title: options.title || 'Video Post',
        video_poster_url: mediaAsset.websocketUrl,
        url: mediaAsset.websocketUrl,
        nsfw: options.nsfw || false,
        spoiler: options.spoiler || false,
        resubmit: true
    };

    if (options.flairId) {
        postData.flair_id = options.flairId;
    }
    if (options.flairText) {
        postData.flair_text = options.flairText;
    }

    const response = await axios.post(
        `${API_BASE_URL}/api/submit`,
        postData,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': userAgent,
                'Content-Type': 'application/json'
            }
        }
    );

    console.log('Reddit post created:', response.data);
    return response.data;
}