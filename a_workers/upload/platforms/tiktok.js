import fs from 'fs/promises';
import fetch from 'node-fetch';

export async function uploadToTikTok(token, job) {
    //console.log(token, metadata, job);
    //const success = Math.random() > 0.1;

    //static values for now
    const accessToken = token.sub.access_token;

    //token is here, maybe its to old/expired?
    //yes that was the case, upload works now!!!!
    console.log(accessToken);
    uploadVideo(accessToken, 'test.mp4', job.video.title, job.video.description, 'SELF_ONLY');

    /*if (success) {
        console.log(`✅ Successfully uploaded to TikTok`);

        await this.updateJobStatus(job.job_id, 'completed', null, {
            platform: job.platform,
            uploaded_at: new Date().toISOString(),
            video_id: job.video_id,
            platform_response: 'Mock upload successful'
        });
    } else {
        throw new Error('Simulated upload failure');
    }*/
}

//copied over from backend/platforms/tiktok.js
async function uploadVideo(accessToken, videoPath, title, description, privacyLevel = 'SELF_ONLY') {
    try {
        //const accessToken = await this._getAccessToken();

        let chunkSize = 128 * 1024 * 1024; //128MB
        const fileStat = await fs.stat(videoPath);
        let fileSize = fileStat.size;

        if (fileSize < chunkSize) {
            chunkSize = fileSize;
        }

        console.log(`Uploading video of size ${fileSize} bytes in chunks of ${chunkSize} bytes`, String(Math.ceil(fileSize / chunkSize)));

        const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                post_info: {
                    title: title,
                    privacy_level: privacyLevel,
                    disable_duet: false,
                    disable_comment: true,
                    disable_stitch: false,
                    video_cover_timestamp_ms: 1000
                },
                source_info: {
                    source: 'FILE_UPLOAD',
                    video_size: fileSize,
                    chunk_size: chunkSize,
                    total_chunk_count: Math.ceil(fileSize / chunkSize)
                }
            })
        });

        if (!initResponse.ok) {
            const errorText = await initResponse.text();
            console.log('Init response status:', initResponse.status);
            throw new Error(`Failed to initialize upload: ${errorText}`);
        }

        const initData = await initResponse.json();
        const uploadUrl = initData.data.upload_url;
        const publishId = initData.data.publish_id;
        const videoBuffer = await fs.readFile(videoPath);
        const totalChunks = Math.ceil(fileSize / chunkSize);
        console.log(`Uploading ${totalChunks} chunk(s)`);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, fileSize);
            const chunk = videoBuffer.slice(start, end);

            console.log(`Uploading chunk ${i + 1}/${totalChunks}: bytes ${start}-${end - 1}/${fileSize}`);

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'video/mp4',
                    'Content-Length': chunk.length.toString(),
                    'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`
                },
                body: chunk
            });

            console.log('Upload response status:', uploadResponse.status);

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.log('Upload response error:', errorText);
                throw new Error(`Failed to upload video chunk ${i + 1} (status ${uploadResponse.status}): ${errorText}`);
            }

            console.log(`Chunk ${i + 1} uploaded successfully`);
        }

        console.log('All chunks uploaded to TikTok successfully');
        return {
            publish_id: publishId,
            message: 'Video uploaded successfully'
        };
    } catch (err) {
        console.error('Error uploading video to TikTok:', err);
        throw err;
    }
}
