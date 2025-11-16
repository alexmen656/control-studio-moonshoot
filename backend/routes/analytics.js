import express from 'express';
import { authMiddleware, projectAccessMiddleware } from '../utils/auth.js';
import { retrieveTokenByProjectID } from '../utils/token_manager.js';
import * as db from '../utils/db.js'

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

// ============================================
// NEW LIVE ANALYTICS ROUTES (5-min intervals)
// ============================================

router.get('/live/projects/:projectId/latest', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await db.query(`
      SELECT * FROM latest_channel_analytics
      WHERE project_id = $1
      ORDER BY platform
    `, [projectId]);

    res.json({
      project_id: parseInt(projectId),
      platforms: result.rows
    });

  } catch (error) {
    console.error('Error fetching latest analytics:', error);
    res.status(500).json({ error: 'Failed to fetch latest analytics' });
  }
});

router.get('/live/projects/:projectId/platforms/:platform', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { projectId, platform } = req.params;
    const { startTime, endTime, limit = 288 } = req.query; // 288 = 24 hours at 5-min intervals

    let query = `
      SELECT 
        id, project_id, platform,
        followers, subscribers,
        total_videos, total_posts, total_tweets,
        total_views, total_likes, total_comments, total_shares,
        total_retweets, total_replies, total_upvotes,
        engagement_rate, average_score, karma,
        total_reach, total_impressions,
        collected_at
      FROM channel_analytics
      WHERE project_id = $1 AND platform = $2
    `;

    const params = [projectId, platform];
    let paramIndex = 3;

    if (startTime) {
      query += ` AND collected_at >= $${paramIndex}`;
      params.push(startTime);
      paramIndex++;
    }

    if (endTime) {
      query += ` AND collected_at <= $${paramIndex}`;
      params.push(endTime);
      paramIndex++;
    }

    query += ` ORDER BY collected_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    res.json({
      project_id: parseInt(projectId),
      platform,
      data_points: result.rows.length,
      analytics: result.rows.reverse()
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
});

router.get('/live/projects/:projectId/platforms/:platform/24h', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { projectId, platform } = req.params;

    const result = await db.query(`
      SELECT 
        collected_at,
        followers, subscribers,
        total_views, total_likes, total_comments, total_shares,
        engagement_rate,
        total_reach, total_impressions
      FROM channel_analytics
      WHERE project_id = $1 
        AND platform = $2
        AND collected_at >= NOW() - INTERVAL '24 hours'
      ORDER BY collected_at ASC
    `, [projectId, platform]);

    res.json({
      project_id: parseInt(projectId),
      platform,
      time_range: '24h',
      data_points: result.rows.length,
      analytics: result.rows
    });
  } catch (error) {
    console.error('Error fetching 24h analytics:', error);
    res.status(500).json({ error: 'Failed to fetch 24h analytics' });
  }
});

router.get('/live/projects/:projectId/platforms/:platform/content', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { projectId, platform } = req.params;
    const { limit = 50, sortBy = 'views' } = req.query;

    const validSortFields = ['views', 'likes', 'comments', 'shares', 'collected_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'views';

    const result = await db.query(`
      SELECT DISTINCT ON (content_id)
        content_id, content_type, title,
        views, likes, comments, shares,
        retweets, replies, upvotes, score,
        collected_at
      FROM content_analytics
      WHERE project_id = $1 AND platform = $2
      ORDER BY content_id, collected_at DESC
      LIMIT $3
    `, [projectId, platform, parseInt(limit)]);

    const sortedRows = result.rows.sort((a, b) => {
      if (sortField === 'collected_at') {
        return new Date(b[sortField]) - new Date(a[sortField]);
      }
      return (b[sortField] || 0) - (a[sortField] || 0);
    });

    res.json({
      project_id: parseInt(projectId),
      platform,
      content_count: sortedRows.length,
      content: sortedRows
    });
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({ error: 'Failed to fetch content analytics' });
  }
});

router.get('/live/projects/:projectId/platforms/:platform/trends', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { projectId, platform } = req.params;

    const result = await db.query(`
      WITH latest AS (
        SELECT * FROM channel_analytics
        WHERE project_id = $1 AND platform = $2
        ORDER BY collected_at DESC
        LIMIT 1
      ),
      previous AS (
        SELECT * FROM channel_analytics
        WHERE project_id = $1 AND platform = $2
          AND collected_at <= NOW() - INTERVAL '24 hours'
        ORDER BY collected_at DESC
        LIMIT 1
      )
      SELECT 
        l.followers as current_followers,
        p.followers as previous_followers,
        l.total_views as current_views,
        p.total_views as previous_views,
        l.total_likes as current_likes,
        p.total_likes as previous_likes,
        l.engagement_rate as current_engagement,
        p.engagement_rate as previous_engagement,
        l.collected_at as current_time,
        p.collected_at as previous_time
      FROM latest l
      LEFT JOIN previous p ON true
    `, [projectId, platform]);

    if (result.rows.length === 0) {
      return res.json({
        project_id: parseInt(projectId),
        platform,
        trends: null,
        message: 'No data available'
      });
    }

    const data = result.rows[0];
    const trends = {
      followers: {
        current: data.current_followers || 0,
        previous: data.previous_followers || 0,
        change: (data.current_followers || 0) - (data.previous_followers || 0),
        percentage: data.previous_followers > 0
          ? (((data.current_followers - data.previous_followers) / data.previous_followers) * 100).toFixed(2)
          : 0
      },
      views: {
        current: data.current_views || 0,
        previous: data.previous_views || 0,
        change: (data.current_views || 0) - (data.previous_views || 0),
        percentage: data.previous_views > 0
          ? (((data.current_views - data.previous_views) / data.previous_views) * 100).toFixed(2)
          : 0
      },
      likes: {
        current: data.current_likes || 0,
        previous: data.previous_likes || 0,
        change: (data.current_likes || 0) - (data.previous_likes || 0),
        percentage: data.previous_likes > 0
          ? (((data.current_likes - data.previous_likes) / data.previous_likes) * 100).toFixed(2)
          : 0
      },
      engagement_rate: {
        current: parseFloat(data.current_engagement) || 0,
        previous: parseFloat(data.previous_engagement) || 0,
        change: (parseFloat(data.current_engagement) || 0) - (parseFloat(data.previous_engagement) || 0)
      },
      time_range: {
        current: data.current_time,
        previous: data.previous_time
      }
    };

    res.json({
      project_id: parseInt(projectId),
      platform,
      trends
    });
  } catch (error) {
    console.error('Error fetching analytics trends:', error);
    res.status(500).json({ error: 'Failed to fetch analytics trends' });
  }
});

router.get('/live/projects/:projectId/overview', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await db.query(`
      SELECT 
        platform,
        followers,
        total_videos + total_posts + total_tweets as total_content,
        total_views,
        total_likes,
        total_comments,
        engagement_rate,
        collected_at
      FROM latest_channel_analytics
      WHERE project_id = $1
      ORDER BY platform
    `, [projectId]);

    const totals = result.rows.reduce((acc, row) => ({
      total_followers: acc.total_followers + (row.followers || 0),
      total_content: acc.total_content + (row.total_content || 0),
      total_views: acc.total_views + (row.total_views || 0),
      total_likes: acc.total_likes + (row.total_likes || 0),
      total_comments: acc.total_comments + (row.total_comments || 0)
    }), {
      total_followers: 0,
      total_content: 0,
      total_views: 0,
      total_likes: 0,
      total_comments: 0
    });

    res.json({
      project_id: parseInt(projectId),
      platforms: result.rows,
      totals,
      platform_count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching project overview:', error);
    res.status(500).json({ error: 'Failed to fetch project overview' });
  }
});

router.get('/live/projects/:projectId/videos/:videoId', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { projectId, videoId } = req.params;

    const videoResult = await db.query(`
      SELECT id, title
      FROM videos
      WHERE id = $1 AND project_id = $2
    `, [videoId, projectId]);

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoResult.rows[0];

    const uploadResults = await db.query(`
      SELECT 
        platform,
        platform_id
      FROM upload_results
      WHERE video_id = $1 AND project_id = $2
    `, [videoId, projectId]);

    console.log('Video:', video.title);
    console.log('Upload results:', uploadResults.rows);

    const platformData = [];
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    for (const uploadResult of uploadResults.rows) {
      const { platform, platform_id } = uploadResult;
      
      try {
        const analyticsResult = await db.query(`
          SELECT 
            platform,
            views,
            likes,
            comments,
            shares,
            retweets,
            collected_at
          FROM content_analytics
          WHERE project_id = $1 
            AND platform = $2 
            AND content_id = $3
          ORDER BY collected_at DESC
          LIMIT 1
        `, [projectId, platform, platform_id]);
        if (analyticsResult.rows.length > 0) {
          const analytics = analyticsResult.rows[0];
          const views = Number(analytics.views) || 0;
          const likes = Number(analytics.likes) || 0;
          const comments = Number(analytics.comments) || 0;
          const shares = Number(analytics.shares || analytics.retweets) || 0;

          totalViews += views;
          totalLikes += likes;
          totalComments += comments;
          totalShares += shares;

          const totalEngagements = likes + comments + shares;
          const engagementRate = views > 0 ? ((totalEngagements / views) * 100).toFixed(1) : '0.0';

          platformData.push({
            platform,
            post_id: platform_id,
            views,
            likes,
            comments,
            shares,
            engagement_rate: parseFloat(engagementRate),
            collected_at: analytics.collected_at
          });

          console.log(`Found analytics for ${platform}:`, { views, likes, comments, shares });
        } else {
          console.log(`No analytics found for ${platform} with platform_id: ${platform_id}`);
          
          platformData.push({
            platform,
            post_id: platform_id,
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            engagement_rate: 0,
            collected_at: null
          });
        }
      } catch (err) {
        console.error(`Error fetching analytics for ${platform}:`, err);
      }
    }

    res.json({
      video_id: videoId,
      video_title: video.title,
      project_id: parseInt(projectId),
      total_views: totalViews,
      total_likes: totalLikes,
      total_comments: totalComments,
      total_shares: totalShares,
      platforms: platformData,
      platform_count: platformData.length
    });
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    res.status(500).json({ error: 'Failed to fetch video analytics', details: error.message });
  }
});

export default router;
