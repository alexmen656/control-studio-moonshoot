export async function uploadToReddit(token, job) {
    console.log(token);
    const success = Math.random() > 0.1;

    if (success) {
        console.log(`✅ Successfully uploaded to Reddit`);

        await this.updateJobStatus(job.job_id, 'completed', null, {
            platform: job.platform,
            uploaded_at: new Date().toISOString(),
            video_id: job.video_id,
            platform_response: 'Mock upload successful'
        });
    } else {
        throw new Error('Simulated upload failure');
    }
}