import express from 'express';
import { authMiddleware, projectAccessMiddleware } from '../utils/auth.js';
import { retrieveTokenByProjectID } from '../utils/token_manager.js';
import db from '../utils/db.js';

const router = express.Router();

// ============================================
// ANALYTICS ROUTES
// ============================================

router.get('/hourly', async (req, res) => {
  try {
    const { platform, project_id, hours = 48 } = req.query;
    const PROJECT_ID = project_id || 2;

    //simulate cause I need to build another worker to fetch hourly data from each platform
    let totalViews = 0;
    const platforms = platform ? [platform] : ['youtube', 'tiktok', 'instagram', 'facebook', 'x', 'reddit'];

    for (const plat of platforms) {
      try {
        switch (plat) {
          case 'youtube':
            const youtubeToken = await retrieveTokenByProjectID('youtube_token', PROJECT_ID);
            if (youtubeToken) totalViews += Math.floor(Math.random() * 10000) + 5000;
            break;
          case 'tiktok':
            const tiktokToken = await retrieveTokenByProjectID('tiktok_token', PROJECT_ID);
            if (tiktokToken) totalViews += Math.floor(Math.random() * 8000) + 3000;
            break;
          case 'instagram':
            const instagramToken = await retrieveTokenByProjectID('instagram_token', PROJECT_ID);
            if (instagramToken) totalViews += Math.floor(Math.random() * 7000) + 2000;
            break;
          case 'facebook':
            const facebookToken = await retrieveTokenByProjectID('facebook_token', PROJECT_ID);
            if (facebookToken) totalViews += Math.floor(Math.random() * 6000) + 1500;
            break;
          case 'x':
            const xToken = await retrieveTokenByProjectID('x_token', PROJECT_ID);
            if (xToken) totalViews += Math.floor(Math.random() * 5000) + 1000;
            break;
          case 'reddit':
            const redditToken = await retrieveTokenByProjectID('reddit_token', PROJECT_ID);
            if (redditToken) totalViews += Math.floor(Math.random() * 4000) + 800;
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${plat} for hourly data:`, error);
      }
    }

    const hourlyData = [];
    const labels = [];
    const now = new Date();

    for (let i = parseInt(hours) - 1; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
      labels.push(hourStr);

      const hourOfDay = hour.getHours();
      let multiplier = 1;

      if (hourOfDay >= 12 && hourOfDay <= 20) {
        multiplier = 1.5 + Math.random() * 0.5;
      } else if (hourOfDay >= 6 && hourOfDay < 12) {
        multiplier = 1.2 + Math.random() * 0.3;
      } else {
        multiplier = 0.5 + Math.random() * 0.3;
      }

      const viewsForHour = Math.floor((totalViews / parseInt(hours)) * multiplier);
      hourlyData.push(viewsForHour);
    }

    res.json({
      labels,
      data: hourlyData,
      totalViews,
      hours: parseInt(hours)
    });
  } catch (error) {
    console.error('Error fetching hourly analytics:', error);
    res.status(500).json({ error: 'Error fetching hourly analytics', details: error.message });
  }
});

router.get('/total', async (req, res) => {
  try {
    const { platform, project_id } = req.query;
    const PROJECT_ID = project_id || 2;

    let analyticsData = {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalVideos: 0,
      platforms: {},
      videos: []
    };

    if (platform) {
      try {
        switch (platform) {
          case 'youtube':
            const youtubeToken = await retrieveTokenByProjectID('youtube_token', PROJECT_ID);
            if (youtubeToken) {
              analyticsData.totalViews = Math.floor(Math.random() * 50000) + 10000;
              analyticsData.totalLikes = Math.floor(Math.random() * 5000) + 1000;
              analyticsData.totalComments = Math.floor(Math.random() * 1000) + 200;
              analyticsData.totalShares = Math.floor(Math.random() * 500) + 100;
              analyticsData.totalVideos = Math.floor(Math.random() * 20) + 5;
            }
            break;
          case 'tiktok':
            const tiktokToken = await retrieveTokenByProjectID('tiktok_token', PROJECT_ID);
            if (tiktokToken) {
              analyticsData.totalViews = Math.floor(Math.random() * 40000) + 8000;
              analyticsData.totalLikes = Math.floor(Math.random() * 4000) + 800;
              analyticsData.totalComments = Math.floor(Math.random() * 800) + 150;
              analyticsData.totalShares = Math.floor(Math.random() * 400) + 80;
              analyticsData.totalVideos = Math.floor(Math.random() * 15) + 3;
            }
            break;
          case 'instagram':
            const instagramToken = await retrieveTokenByProjectID('instagram_token', PROJECT_ID);
            if (instagramToken) {
              analyticsData.totalViews = Math.floor(Math.random() * 35000) + 7000;
              analyticsData.totalLikes = Math.floor(Math.random() * 3500) + 700;
              analyticsData.totalComments = Math.floor(Math.random() * 700) + 120;
              analyticsData.totalShares = Math.floor(Math.random() * 350) + 70;
              analyticsData.totalVideos = Math.floor(Math.random() * 18) + 4;
            }
            break;
          case 'facebook':
            const facebookToken = await retrieveTokenByProjectID('facebook_token', PROJECT_ID);
            if (facebookToken) {
              analyticsData.totalViews = Math.floor(Math.random() * 30000) + 6000;
              analyticsData.totalLikes = Math.floor(Math.random() * 3000) + 600;
              analyticsData.totalComments = Math.floor(Math.random() * 600) + 100;
              analyticsData.totalShares = Math.floor(Math.random() * 300) + 60;
              analyticsData.totalVideos = Math.floor(Math.random() * 12) + 3;
            }
            break;
          case 'x':
            const xToken = await retrieveTokenByProjectID('x_token', PROJECT_ID);
            if (xToken) {
              analyticsData.totalViews = Math.floor(Math.random() * 25000) + 5000;
              analyticsData.totalLikes = Math.floor(Math.random() * 2500) + 500;
              analyticsData.totalComments = Math.floor(Math.random() * 500) + 80;
              analyticsData.totalShares = Math.floor(Math.random() * 250) + 50;
              analyticsData.totalVideos = Math.floor(Math.random() * 10) + 2;
            }
            break;
          case 'reddit':
            const redditToken = await retrieveTokenByProjectID('reddit_token', PROJECT_ID);
            if (redditToken) {
              analyticsData.totalViews = Math.floor(Math.random() * 20000) + 4000;
              analyticsData.totalLikes = Math.floor(Math.random() * 2000) + 400;
              analyticsData.totalComments = Math.floor(Math.random() * 400) + 60;
              analyticsData.totalShares = Math.floor(Math.random() * 200) + 40;
              analyticsData.totalVideos = Math.floor(Math.random() * 8) + 2;
            }
            break;
          default:
            return res.status(400).json({ error: 'Unsupported platform' });
        }

        analyticsData.platforms[platform] = {
          views: analyticsData.totalViews,
          likes: analyticsData.totalLikes,
          comments: analyticsData.totalComments,
          shares: analyticsData.totalShares,
          videos: analyticsData.totalVideos
        };
      } catch (platformError) {
        console.error(`Error fetching ${platform} analytics:`, platformError);
        analyticsData.error = `Failed to fetch ${platform} analytics: ${platformError.message}`;
      }
    } else {
      const platforms = ['youtube', 'tiktok', 'instagram', 'facebook', 'x', 'reddit'];

      for (const plat of platforms) {
        try {
          const token = await retrieveTokenByProjectID(`${plat}_token`, PROJECT_ID);
          if (token) {
            const views = Math.floor(Math.random() * 50000) + 10000;
            const likes = Math.floor(Math.random() * 5000) + 1000;
            const comments = Math.floor(Math.random() * 1000) + 200;
            const shares = Math.floor(Math.random() * 500) + 100;
            const videos = Math.floor(Math.random() * 20) + 5;

            analyticsData.totalViews += views;
            analyticsData.totalLikes += likes;
            analyticsData.totalComments += comments;
            analyticsData.totalShares += shares;
            analyticsData.totalVideos += videos;

            analyticsData.platforms[plat] = {
              views,
              likes,
              comments,
              shares,
              videos
            };
          }
        } catch (platformError) {
          console.error(`Error fetching ${plat} analytics:`, platformError);
        }
      }
    }

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching total analytics:', error);
    res.status(500).json({ error: 'Error fetching analytics', details: error.message });
  }
});

// ============================================
// ACTIVITY ROUTES
// ============================================

router.get('/activity', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const PROJECT_ID = req.query.project_id;

    if (!PROJECT_ID) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    const videosQuery = `
      SELECT 
        id, title, filename, thumbnail, 
        upload_date, updated_at, scheduled_date, 
        published_at, status
      FROM videos 
      WHERE project_id = $1
      ORDER BY upload_date DESC
      LIMIT 100
    `;
    const videosResult = await db.query(videosQuery, [PROJECT_ID]);

    const jobsQuery = `
      SELECT 
        j.job_id, j.video_id, j.platform, 
        j.status, j.created_at, j.started_at, 
        j.completed_at, j.error_message,
        w.worker_name, w.hostname
      FROM worker_jobs j
      LEFT JOIN workers w ON j.worker_id = w.worker_id
      WHERE j.metadata->>'project_id' = $1
      ORDER BY j.created_at DESC
      LIMIT 100
    `;
    const jobsResult = await db.query(jobsQuery, [PROJECT_ID.toString()]);

    const activities = [];

    videosResult.rows.forEach(video => {
      activities.push({
        id: `upload-${video.id}`,
        type: 'upload',
        title: `Video uploaded: ${video.title}`,
        description: 'New video uploaded successfully',
        timestamp: video.upload_date,
        thumbnail: video.thumbnail,
        status: 'success',
        videoId: video.id
      });

      if (video.scheduled_date) {
        activities.push({
          id: `scheduled-${video.id}`,
          type: 'scheduled',
          title: `Video scheduled: ${video.title}`,
          description: `Scheduled for ${new Date(video.scheduled_date).toLocaleString('de-DE')}`,
          timestamp: video.upload_date,
          thumbnail: video.thumbnail,
          status: 'pending',
          videoId: video.id
        });
      }

      if (video.published_at) {
        activities.push({
          id: `published-${video.id}`,
          type: 'published',
          title: `Video published: ${video.title}`,
          description: 'Your video is now live',
          timestamp: video.published_at,
          thumbnail: video.thumbnail,
          status: 'success',
          videoId: video.id
        });
      }

      if (video.updated_at && video.updated_at !== video.upload_date) {
        activities.push({
          id: `edited-${video.id}`,
          type: 'edited',
          title: `Video updated: ${video.title}`,
          description: 'Video metadata or details updated',
          timestamp: video.updated_at,
          thumbnail: video.thumbnail,
          status: 'success',
          videoId: video.id
        });
      }
    });

    jobsResult.rows.forEach(job => {
      const video = videosResult.rows.find(v => v.id === job.video_id);
      const videoTitle = video?.title || 'Unknown Video';

      if (job.status === 'assigned' || job.status === 'processing') {
        activities.push({
          id: `job-${job.job_id}`,
          type: 'scheduled',
          title: `Processing for ${job.platform}`,
          description: `Video: ${videoTitle}${job.worker_name ? ` (Worker: ${job.worker_name})` : ''}`,
          timestamp: job.started_at || job.created_at,
          platforms: [job.platform],
          thumbnail: video?.thumbnail,
          status: 'pending',
          videoId: job.video_id,
          jobId: job.job_id
        });
      } else if (job.status === 'completed') {
        activities.push({
          id: `job-completed-${job.job_id}`,
          type: 'published',
          title: `Published to ${job.platform}`,
          description: `Video: ${videoTitle}`,
          timestamp: job.completed_at,
          platforms: [job.platform],
          thumbnail: video?.thumbnail,
          status: 'success',
          videoId: job.video_id,
          jobId: job.job_id
        });
      } else if (job.status === 'failed') {
        activities.push({
          id: `job-failed-${job.job_id}`,
          type: 'error',
          title: `Failed to publish to ${job.platform}`,
          description: job.error_message || `Video: ${videoTitle}`,
          timestamp: job.completed_at || job.created_at,
          platforms: [job.platform],
          thumbnail: video?.thumbnail,
          status: 'error',
          videoId: job.video_id,
          jobId: job.job_id
        });
      }
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      activities,
      total: activities.length
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
  }
});

export default router;
