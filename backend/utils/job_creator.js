import db from './db.js';

/**
 * Creates upload jobs for specified platforms
 * @param {string} video_id - Video ID
 * @param {string[]} platforms - Array of platform names
 * @param {number} project_id - Project ID
 * @param {number} priority - Job priority (default 0)
 * @returns {Promise<Array>} Array of created jobs with status information
 */
export async function createUploadJobs(video_id, platforms, project_id, priority = 0) {
  if (!video_id || !platforms || platforms.length === 0) {
    throw new Error('video_id and platforms are required');
  }

  const { selectBestWorker, assignJobToWorker } = await import('./worker_selector.js');

  const video = await db.getVideoById(video_id);
  if (!video) {
    throw new Error('Video not found');
  }

  const jobs = [];

  for (const platform of platforms) {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      await db.query(
        `INSERT INTO worker_jobs 
         (job_id, video_id, platform, status, priority, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          jobId,
          video_id,
          platform,
          'pending',
          priority,
          JSON.stringify({
            job_type: 'upload',
            video_title: video.title,
            video_path: video.path,
            project_id: project_id
          })
        ]
      );

      try {
        const selectedWorker = await selectBestWorker(project_id, [platform], 'upload');
        await assignJobToWorker(selectedWorker.worker_id, jobId);

        jobs.push({
          job_id: jobId,
          platform,
          worker: selectedWorker,
          status: 'assigned'
        });

        console.log(`✓ Created upload job ${jobId} for ${platform} → Worker: ${selectedWorker.worker_name}`);
      } catch (workerError) {
        console.log(`⚠ Created upload job ${jobId} for ${platform} → Queued (no worker available: ${workerError.message})`);
        
        jobs.push({
          job_id: jobId,
          platform,
          status: 'pending',
          message: 'Job queued - will be processed when worker becomes available'
        });
      }
    } catch (error) {
      console.error(`✗ Failed to create job for ${platform}:`, error.message);
      jobs.push({
        platform,
        error: error.message,
        status: 'failed_to_create'
      });
    }
  }

  return jobs;
}

/**
 * Creates analytics jobs for specified platforms
 * @param {string[]} platforms - Array of platform names
 * @param {number} project_id - Project ID
 * @param {string} task_type - Type of analytics task (default 'channel_analytics')
 * @param {number} priority - Job priority (default 0)
 * @param {object} metadata - Additional metadata
 * @returns {Promise<Array>} Array of created jobs with status information
 */
export async function createAnalyticsJobs(
  platforms,
  project_id,
  task_type = 'channel_analytics',
  priority = 0,
  metadata = {}
) {
  if (!platforms || platforms.length === 0) {
    throw new Error('platforms are required');
  }

  const validTaskTypes = ['channel_analytics', 'video_analytics', 'hourly_analytics'];
  if (task_type && !validTaskTypes.includes(task_type)) {
    throw new Error(`task_type must be one of: ${validTaskTypes.join(', ')}`);
  }

  const { selectBestWorker, assignJobToWorker } = await import('./worker_selector.js');

  const jobs = [];

  for (const platform of platforms) {
    const jobId = `analytics-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      await db.query(
        `INSERT INTO worker_jobs 
         (job_id, platform, status, priority, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          jobId,
          platform,
          'pending',
          priority,
          JSON.stringify({
            job_type: 'analytics',
            task_type: task_type,
            project_id: project_id,
            ...metadata
          })
        ]
      );

      try {
        const selectedWorker = await selectBestWorker(project_id, [platform], 'analytics');
        await assignJobToWorker(selectedWorker.worker_id, jobId);

        jobs.push({
          job_id: jobId,
          platform,
          task_type: task_type,
          worker: selectedWorker,
          status: 'assigned'
        });

        console.log(`✓ Created analytics job ${jobId} for ${platform} → Worker: ${selectedWorker.worker_name}`);
      } catch (workerError) {
        console.log(`⚠ Created analytics job ${jobId} for ${platform} → Queued (no worker available: ${workerError.message})`);
        
        jobs.push({
          job_id: jobId,
          platform,
          task_type: task_type,
          status: 'pending',
          message: 'Job queued - will be processed when worker becomes available'
        });
      }
    } catch (error) {
      console.error(`✗ Failed to create analytics job for ${platform}:`, error.message);
      jobs.push({
        platform,
        error: error.message,
        status: 'failed_to_create'
      });
    }
  }

  return jobs;
}
