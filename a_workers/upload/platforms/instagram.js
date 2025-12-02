import { updateJobStatus } from "../utils/updateJobStatus.js";
import fs from "fs/promises";
import axios from "axios";

export async function uploadToInstagram(token, job) {
    console.log('Starting Instagram video upload...');

    const instagramToken = {
        accessToken: token.sub.accessToken,
        instagramUserId: token.sub.instagramUserId
    };

    const videoFile = {
        path: job.videoFilePath
    };

    const options = {
        caption: job.video.title || 'Uploaded via Reelmia.com'
    };

    if (job.video?.locationId && job.video.locationId.trim() !== '') {
        options.locationId = job.video.locationId;
    }

    if (job.video?.shareToFeed !== undefined && job.video.shareToFeed !== null) {
        options.shareToFeed = job.video.shareToFeed;
    }

    if (job.video?.coverUrl && job.video.coverUrl.trim() !== '') {
        options.coverUrl = job.video.coverUrl;
    }

    if (job.video?.audioName && job.video.audioName.trim() !== '') {
        options.audioName = job.video.audioName;
    }

    console.log('Uploading to Instagram with options:', options);

    try {
        const uploadResponse = await uploadReel(instagramToken, videoFile, options);
        console.log(`✅ Successfully uploaded to Instagram`);

        await updateJobStatus(job.job_id, 'completed', null, {
            platform: job.platform,
            uploaded_at: new Date().toISOString(),
            video_id: job.video_id,
            upload_data: {
                instagram_media_id: uploadResponse.id,
                platform_response: uploadResponse
            }
        });
    } catch (error) {
        console.error('❌ Instagram upload failed:', error.message);
        throw error;
    }
}

async function uploadReel(token, videoFile, options = {}) {
    console.log('Starting Instagram Reel upload process...');

    try {
        const instagramUserId = token.instagramUserId;
        const accessToken = token.accessToken;

        const containerId = await _createReelContainer(accessToken, instagramUserId, options);
        await _uploadVideoToContainer(videoFile, containerId, accessToken);
        await _waitForContainerReady(containerId, accessToken);

        const publishedReel = await _publishContainer(containerId, accessToken, instagramUserId);
        return publishedReel;
    } catch (err) {
        console.error('Error during Instagram reel upload:', err);
        throw err;
    }
}

async function _createReelContainer(accessToken, instagramUserId, options) {
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

async function _uploadVideoToContainer(videoFile, containerId, accessToken) {
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

async function _waitForContainerReady(containerId, accessToken, maxAttempts = 10) {
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

async function _publishContainer(containerId, accessToken, instagramUserId) {
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