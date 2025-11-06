import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { startJobScheduler } from './utils/job_scheduler.js';
import * as db from './utils/db.js'
// routes
import workersRoutes from './routes/workers.js';
import jobsRoutes from './routes/jobs.js';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import videosRoutes from './routes/videos.js';
import platformsRoutes from './routes/platforms.js';
import analyticsRoutes from './routes/analytics.js';
import regionsRoutes from './routes/regions.js';
import usersRoutes from './routes/users.js';
import { authMiddleware, projectAccessMiddleware } from './utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const app = express();
const PORT = process.env.PORT || 6709;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.send('Control Studio API - Social Media Manager');
});

app.get('/api/used-storage', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const totalBytes = await db.getTotalStorageUsed()

    res.json({ used_storage: totalBytes, total_storage: 5 * 1024 * 1024 * 1024 })
  } catch (error) {
    console.error('Error calculating used storage:', error)
    res.status(500).json({ error: 'Error calculating used storage' })
  }
});

app.get('/api/activity', authMiddleware, projectAccessMiddleware, async (req, res) => {
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
          title: `Published on ${job.platform}`,
          description: `Video: ${videoTitle}`,
          timestamp: job.completed_at || job.created_at,
          platforms: [job.platform],
          thumbnail: video?.thumbnail,
          status: 'success',
          videoId: job.video_id,
          jobId: job.job_id
        });
      } else if (job.status === 'failed') {
        activities.push({
          id: `job-failed-${job.job_id}`,
          type: 'published',
          title: `Failed on ${job.platform}`,
          description: job.error_message || `Video: ${videoTitle}`,
          timestamp: job.completed_at || job.created_at,
          platforms: [job.platform],
          thumbnail: video?.thumbnail,
          status: 'failed',
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

app.use('/api/workers', workersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api', platformsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/regions', regionsRoutes);
app.use('/api/users', usersRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`Database: PostgreSQL`);
  
  // job scheduler
  startJobScheduler(30000);
});
