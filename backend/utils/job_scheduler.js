import db from './db.js';
import { selectBestWorker, assignJobToWorker } from './worker_selector.js';

let schedulerInterval = null;

async function assignPendingJobs() {
  try {
    const pendingJobs = await db.query(`
      SELECT * FROM worker_jobs 
      WHERE status = 'pending' 
        AND worker_id IS NULL
      ORDER BY priority DESC, created_at ASC
    `);

    if (pendingJobs.rows.length === 0) {
      return;
    }

    console.log(`📋 Found ${pendingJobs.rows.length} pending job(s) to assign`);

    for (const job of pendingJobs.rows) {
      try {
        const metadata = job.metadata || {};
        const jobType = metadata.job_type || 'upload';
        const platform = job.platform;
        const projectId = metadata.project_id;

        const selectedWorker = await selectBestWorker(
          projectId,
          platform ? [platform] : [],
          jobType
        );

        await assignJobToWorker(selectedWorker.worker_id, job.job_id);

        console.log(`✓ Assigned pending job ${job.job_id} (${platform}) to worker ${selectedWorker.worker_name}`);
      } catch (error) {
        if (error.message.includes('No workers available') || error.message.includes('at capacity')) {
                continue;
        }
        
        console.error(`Failed to assign job ${job.job_id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in job scheduler:', error);
  }
}

export function startJobScheduler(intervalMs = 30000) {
  if (schedulerInterval) {
    console.log('⚠ Job scheduler already running');
    return;
  }

  console.log(`🚀 Starting job scheduler (interval: ${intervalMs}ms)`);
  
  assignPendingJobs();
  
  schedulerInterval = setInterval(assignPendingJobs, intervalMs);
}

export function stopJobScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('🛑 Job scheduler stopped');
  }
}

export async function triggerJobAssignment() {
  console.log('🔄 Manually triggering job assignment...');
  await assignPendingJobs();
}

export default {
  startJobScheduler,
  stopJobScheduler,
  triggerJobAssignment,
  assignPendingJobs
};
