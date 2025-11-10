import * as db from './db.js';
import { createUploadJobs } from './job_creator.js';

const SCHEDULER_INTERVAL = 30 * 1000;
const PUBLISH_WINDOW = 10 * 60 * 1000;

function shouldPublishVideo(scheduledDate) {
  const now = new Date();
  const scheduled = new Date(scheduledDate);
  const timeDiff = scheduled - now;

  console.log(now, scheduled, timeDiff);
  return timeDiff <= PUBLISH_WINDOW && timeDiff > 0;
}

async function getVideosForScheduling() {
  try {
    console.log(`[${new Date().toLocaleTimeString()}] Checking for videos to schedule...`);

    const videos = await db.getAllVideos();

    if (!videos || videos.length === 0) {
      console.log('No videos found in database');
      return [];
    }

    const videosToSchedule = videos.filter(video => {
      if (video.status !== 'scheduled') {
        return false;
      }

      if (!video.scheduledDate) {
        console.warn(`Video ${video.id} has no scheduled date`);
        return false;
      }

      if (!video.platforms || video.platforms.length === 0) {
        console.warn(`Video ${video.id} has no platforms selected`);
        return false;
      }

      return shouldPublishVideo(video.scheduledDate);
    });

    if (videosToSchedule.length > 0) {
      console.log(`✓ Found ${videosToSchedule.length} video(s) ready for scheduling`);
      videosToSchedule.forEach(video => {
        const scheduledTime = new Date(video.scheduledDate).toLocaleString();
        console.log(`  - Video ID: ${video.id}, Title: "${video.title}", Platforms: ${video.platforms.join(', ')}, Scheduled: ${scheduledTime}`);
      });
    } else {
      console.log('No videos ready for scheduling');
    }

    return videosToSchedule;
  } catch (error) {
    console.error('Error fetching videos for scheduling:', error.message);
    return [];
  }
}

async function createPublishJobsForVideo(video) {
  try {
    console.log(`\n📋 Creating jobs for video: ${video.id} (${video.title})`);

    const platforms = Array.isArray(video.platforms) ? video.platforms : [];

    if (platforms.length === 0) {
      console.warn(`No platforms found for video ${video.id}`);
      return;
    }

    const jobs = await createUploadJobs(
      video.id,
      platforms,
      video.projectId,
      2
    );

    console.log(`✓ Successfully created ${jobs.length} job(s) for video ${video.id}`);

    jobs.forEach(job => {
      if (job.status === 'assigned') {
        console.log(`  ✓ ${job.platform}: Assigned to worker ${job.worker.worker_name}`);
      } else if (job.status === 'pending') {
        console.log(`  ⏳ ${job.platform}: Queued (no worker available)`);
      } else if (job.status === 'failed_to_create') {
        console.log(`  ✗ ${job.platform}: Failed - ${job.error}`);
      }
    });

  } catch (error) {
    console.error(`✗ Error creating jobs for video ${video.id}:`, error.message);
  }
}

export async function startPublishScheduler() {
  console.log('🚀 Starting Publish Scheduler (30s interval, 10min window)');

  setInterval(async () => {
    console.log('scheduler, gogogog!!!')
    try {
      const videosToSchedule = await getVideosForScheduling();

      for (const video of videosToSchedule) {
        await createPublishJobsForVideo(video);
      }

    } catch (error) {
      console.error('[Scheduler Error]', error.message);
    }
  }, SCHEDULER_INTERVAL);

  try {
    const videosToSchedule = await getVideosForScheduling();
    for (const video of videosToSchedule) {
      await createPublishJobsForVideo(video);
    }
  } catch (error) {
    console.error('[Initial Scheduler Run Error]', error.message);
  }
}

export { SCHEDULER_INTERVAL, PUBLISH_WINDOW };
