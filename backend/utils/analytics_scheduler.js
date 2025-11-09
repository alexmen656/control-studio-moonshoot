import * as db from './db.js';

export async function scheduleAnalyticsJobs() {
  try {
    console.log('Scheduling analytics jobs...');
    
    const projectsResult = await db.query('SELECT id FROM projects');
    const projects = projectsResult.rows;

    if (projects.length === 0) {
      console.log('No projects found to schedule analytics for');
      return;
    }

    let jobsCreated = 0;
    const platforms = ['youtube', 'tiktok', 'instagram', 'facebook', 'x', 'reddit'];

    for (const project of projects) {
      const projectId = project.id;

      for (const platform of platforms) {
        try {
          const isConnected = await checkPlatformConnection(platform, projectId);
          
          if (isConnected) {
            const jobId = `analytics-${platform}-${projectId}-${Date.now()}`;
            
            const jobResult = await db.query(`
              INSERT INTO worker_jobs (
                job_id,
                platform,
                video_id,
                status,
                priority,
                metadata,
                created_at
              ) VALUES (
                $1,
                $2,
                NULL,
                'pending',
                5,
                $3,
                CURRENT_TIMESTAMP
              )
              RETURNING job_id
            `, [
              jobId,
              platform,
              JSON.stringify({
                task_type: 'channel_analytics',
                project_id: projectId,
                scheduled_at: new Date().toISOString(),
                job_type: 'analytics'
              })
            ]);

            if (jobResult.rows.length > 0) {
              jobsCreated++;
              console.log(`✅ Created analytics job for ${platform} (project ${projectId})`);
            }
          }
        } catch (error) {
          console.error(`Error checking ${platform} for project ${projectId}:`, error.message);
        }
      }
    }

    console.log(`✅ Scheduled ${jobsCreated} analytics jobs`);
    return jobsCreated;
  } catch (error) {
    console.error('Error scheduling analytics jobs:', error);
    throw error;
  }
}

async function checkPlatformConnection(platform, projectId) {
  try {
    const { retrieveTokenByProjectID } = await import('./token_manager.js');
    
    let tokenKey = null;
    
    switch (platform) {
      case 'youtube':
        tokenKey = 'youtube_token';
        break;
      case 'tiktok':
        tokenKey = 'tiktok_token';
        break;
      case 'instagram':
        tokenKey = 'instagram_business_account';
        break;
      case 'facebook':
        tokenKey = 'facebook_accounts';
        break;
      case 'x':
        tokenKey = 'x_token';
        break;
      case 'reddit':
        tokenKey = 'reddit_token';
        break;
      default:
        return false;
    }

    const token = await retrieveTokenByProjectID(tokenKey, projectId);
    return token !== null && token !== undefined;
  } catch (error) {
    return false;
  }
}

export function startAnalyticsScheduler(intervalMs = 300000) {
  console.log(`Starting analytics scheduler (interval: ${intervalMs}ms = ${intervalMs/60000} minutes)`);
  
  scheduleAnalyticsJobs().catch(error => {
    console.error('Error in initial analytics job scheduling:', error);
  });

  const intervalId = setInterval(() => {
    scheduleAnalyticsJobs().catch(error => {
      console.error('Error in analytics job scheduling:', error);
    });
  }, intervalMs);

  return intervalId;
}

export function stopAnalyticsScheduler(intervalId) {
  if (intervalId) {
    clearInterval(intervalId);
    console.log('⏹Analytics scheduler stopped');
  }
}

export default {
  scheduleAnalyticsJobs,
  startAnalyticsScheduler,
  stopAnalyticsScheduler
};
