import express from 'express';
import { authMiddleware, projectAccessMiddleware } from '../utils/auth.js';
import * as db from './utils/db.js'

const router = express.Router();

// ============================================
// UPLOAD JOB ROUTES
// ============================================

router.post('/', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { video_id, platforms, priority } = req.body;

    if (!video_id || !platforms || platforms.length === 0) {
      return res.status(400).json({ error: 'video_id and platforms are required' });
    }

    const { createUploadJobs } = await import('../utils/job_creator.js');
    const jobs = await createUploadJobs(video_id, platforms, req.project.id, priority || 0);

    res.status(201).json({
      message: 'Jobs created',
      jobs
    });
  } catch (error) {
    console.error('Error creating jobs:', error);
    res.status(500).json({ error: 'Failed to create jobs' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, project_id } = req.query;

    let query = `
      SELECT j.*, w.worker_name, w.hostname
      FROM worker_jobs j
      LEFT JOIN workers w ON j.worker_id = w.worker_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`j.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (project_id) {
      conditions.push(`(j.metadata->>'project_id')::bigint = $${paramCount}`);
      params.push(project_id);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY j.created_at DESC LIMIT 100';

    const result = await db.query(query, params);

    res.json({
      jobs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ============================================
// ANALYTICS JOB ROUTES
// ============================================

router.post('/analytics', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { platforms, task_type, priority, metadata } = req.body;
    const projectId = req.project.id;

    //debug
    console.log('projectId in /api/analytics-jobs:', projectId);

    if (!platforms || platforms.length === 0) {
      return res.status(400).json({ error: 'platforms are required' });
    }

    const { createAnalyticsJobs } = await import('../utils/job_creator.js');
    const jobs = await createAnalyticsJobs(
      platforms,
      projectId,
      task_type || 'channel_analytics',
      priority || 0,
      metadata || {}
    );

    res.status(201).json({
      message: 'Analytics jobs created',
      jobs
    });
  } catch (error) {
    console.error('Error creating analytics jobs:', error);
    res.status(500).json({ error: error.message || 'Failed to create analytics jobs' });
  }
});

router.get('/analytics', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const { status, platform } = req.query;
    const projectId = req.project.id;

    let query = `
      SELECT j.*, w.worker_name, w.hostname
      FROM worker_jobs j
      LEFT JOIN workers w ON j.worker_id = w.worker_id
      WHERE j.metadata->>'job_type' = 'analytics'
        AND j.metadata->>'project_id' = $1
    `;

    const params = [projectId.toString()];
    let paramCount = 2;

    if (status) {
      query += ` AND j.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (platform) {
      query += ` AND j.platform = $${paramCount}`;
      params.push(platform);
      paramCount++;
    }

    query += ' ORDER BY j.created_at DESC LIMIT 100';

    const result = await db.query(query, params);

    res.json({
      jobs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching analytics jobs:', error);
    res.status(500).json({ error: 'Failed to fetch analytics jobs' });
  }
});

export default router;
