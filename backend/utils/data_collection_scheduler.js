import * as db from './db.js';
import { createAnalyticsJobs, createCommentsJobs } from './job_creator.js';
import { retrieveTokenByProjectID } from './token_manager.js';

const PLATFORMS = ['youtube', 'instagram', 'facebook'];

async function checkPlatformConnection(platform, projectId) {
    try {
        let tokenKey = null;

        switch (platform) {
            case 'youtube':
                tokenKey = 'youtube_token';
                break;
            case 'instagram':
                tokenKey = 'instagram_business_account';
                break;
            case 'facebook':
                tokenKey = 'facebook_accounts';
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

async function hasExistingJob(platform, projectId, jobType) {
    try {
        const result = await db.query(`
      SELECT job_id FROM worker_jobs 
      WHERE platform = $1 
        AND metadata->>'project_id' = $2
        AND metadata->>'job_type' = $3
        AND status IN ('pending', 'assigned', 'processing')
      LIMIT 1
    `, [platform, String(projectId), jobType]);

        return result.rows.length > 0;
    } catch (error) {
        console.error(`Error checking existing jobs:`, error.message);
        return false;
    }
}

export async function scheduleDataCollectionJobs() {
    try {
        const projectsResult = await db.query('SELECT id FROM projects');
        const projects = projectsResult.rows;

        if (projects.length === 0) {
            return { analytics: 0, comments: 0 };
        }

        let analyticsJobsCreated = 0;
        let commentsJobsCreated = 0;

        for (const project of projects) {
            const projectId = project.id;

            for (const platform of PLATFORMS) {
                try {
                    const isConnected = await checkPlatformConnection(platform, projectId);

                    if (!isConnected) {
                        continue;
                    }

                    const hasAnalyticsJob = await hasExistingJob(platform, projectId, 'analytics');
                    if (!hasAnalyticsJob) {
                        try {
                            await createAnalyticsJobs([platform], projectId, 'channel_analytics', 5);
                            analyticsJobsCreated++;
                            console.log(`Created analytics job: ${platform} (project ${projectId})`);
                        } catch (err) {
                            console.error(`Failed to create analytics job for ${platform}:`, err.message);
                        }
                    }

                    const hasCommentsJob = await hasExistingJob(platform, projectId, 'comments');
                    if (!hasCommentsJob) {
                        try {
                            await createCommentsJobs([platform], projectId, 'video_comments', 5);
                            commentsJobsCreated++;
                            console.log(`Created comments job: ${platform} (project ${projectId})`);
                        } catch (err) {
                            console.error(`Failed to create comments job for ${platform}:`, err.message);
                        }
                    }

                } catch (error) {
                    console.error(`Error processing ${platform} for project ${projectId}:`, error.message);
                }
            }
        }

        if (analyticsJobsCreated > 0 || commentsJobsCreated > 0) {
            console.log(`Data collection: ${analyticsJobsCreated} analytics + ${commentsJobsCreated} comments jobs created`);
        }

        return { analytics: analyticsJobsCreated, comments: commentsJobsCreated };
    } catch (error) {
        console.error('Error scheduling data collection jobs:', error);
        throw error;
    }
}

export function startDataCollectionScheduler(intervalMs = 30000) {
    console.log(`Starting data collection scheduler (interval: ${intervalMs}ms = ${intervalMs / 1000}s)`);
    console.log(`Platforms: ${PLATFORMS.join(', ')}`);
    console.log(`Job types: analytics, comments`);

    scheduleDataCollectionJobs().catch(error => {
        console.error('Error in initial data collection scheduling:', error);
    });

    const intervalId = setInterval(() => {
        scheduleDataCollectionJobs().catch(error => {
            console.error('Error in data collection scheduling:', error);
        });
    }, intervalMs);

    return intervalId;
}

export function stopDataCollectionScheduler(intervalId) {
    if (intervalId) {
        clearInterval(intervalId);
        console.log('Data collection scheduler stopped');
    }
}

export default {
    scheduleDataCollectionJobs,
    startDataCollectionScheduler,
    stopDataCollectionScheduler
};
