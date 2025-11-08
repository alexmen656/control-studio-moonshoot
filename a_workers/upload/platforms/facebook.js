import { updateJobStatus } from "../utils/updateJobStatus.js";
import axios from "axios";
import fs from "fs/promises";
import FormData from 'form-data';

export async function uploadToFacebook(token, job) {
    console.log('Starting Facebook video upload...');

    const facebookToken = {
        accessToken: token.sub.accessToken,
        pageId: token.sub.pageId
    };

    const videoFile = {
        path: 'test.mp4'
    };

    const options = {
        title: job.video.title || 'Uploaded via Reelmia.com',
        description: job.video.description || '',
    };

    if (job.video?.published !== undefined && job.video.published !== null) {
        options.published = job.video.published;
    }
    if (job.video?.scheduledPublishTime) {
        options.scheduledPublishTime = job.video.scheduledPublishTime;
    }
    if (job.video?.targeting && typeof job.video.targeting === 'object') {
        options.targeting = job.video.targeting;
    }
    if (job.video?.contentCategory) {
        options.contentCategory = job.video.contentCategory;
    }

    console.log('Uploading to Facebook with options:', options);

    try {
        await uploadVideo(facebookToken, videoFile, options);
        console.log(`✅ Successfully uploaded to Facebook`);

        await updateJobStatus(job.job_id, 'completed', null, {
            platform: job.platform,
            uploaded_at: new Date().toISOString(),
            video_id: job.video_id,
            platform_response: 'Upload successful'
        });
    } catch (error) {
        console.error('❌ Facebook upload failed:', error.message);
        throw error;
    }
}

async function uploadVideo(token, videoFile, options = {}) {
    console.log('Starting Facebook Video upload process...');

    try {
        const { accessToken, pageId } = token;
        const { uploadSessionId, startOffset } = await _initializeUpload(videoFile, accessToken, pageId, options);
        await _uploadVideoChunks(videoFile, uploadSessionId, startOffset, accessToken, pageId);
        const publishedVideo = await _finishUpload(uploadSessionId, accessToken, pageId, options);

        return publishedVideo;
    } catch (err) {
        console.error('Error during Facebook video upload:', err);
        throw err;
    }
}

async function _initializeUpload(videoFile, accessToken, pageId, options) {
    console.log('Initializing upload for page ID:', pageId);
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
        console.error('Error initializing upload:', error.response?.data || error.message);
        throw error;
    }
}

async function _uploadVideoChunks(videoFile, uploadSessionId, startOffset, accessToken, pageId) {
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

async function _finishUpload(uploadSessionId, accessToken, pageId, options) {
    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${pageId}/videos`;

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
    if (options.targeting) params.targeting = JSON.stringify(options.targeting);
    if (options.contentCategory) params.content_category = options.contentCategory;

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
