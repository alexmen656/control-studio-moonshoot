import https from 'https';
import fs from 'fs';
import express from 'express';
import * as db from './utils/db.js'
import tls from 'tls';
import { startJobScheduler } from './utils/job_scheduler.js';

const app = express();
app.use(express.json());

const options = {
  key: fs.readFileSync('vps.key'),
  cert: fs.readFileSync('vps.crt'),
  ca: fs.readFileSync('ca.crt'),
  requestCert: true, //true,
  rejectUnauthorized: true, //true,

  //tls versions
  //minVersion: 'TLSv1.2',
  //maxVersion: 'TLSv1.3'

 // minVersion: tls.TLS1_2,
 // maxVersion: tls.TLS1_3
   minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
};

//worker cert middleware
const requireWorkerCert = (req, res, next) => {
  if (!req.socket.authorized) {
    return res.status(401).json({ error: 'Invalid worker certificate' });
  }

    const cert = req.socket.getPeerCertificate();
 /* console.log('Worker Certificate Details:');
  console.log('  Subject:', cert.subject);
  console.log('  Issuer:', cert.issuer);
  console.log('  Valid From:', cert.valid_from);
  console.log('  Valid To:', cert.valid_to);
  console.log('  Common Name (CN):', cert.subject.CN);*/
  
  next();
};

app.post('/api/workers/register', requireWorkerCert, async (req, res) => {
  try {
    console.log('I am through lolololol')
    const { worker_id, worker_name, hostname, capabilities, max_concurrent_tasks } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;

    if (!worker_id) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const existingWorker = await db.query(
      'SELECT * FROM workers WHERE worker_id = $1',
      [worker_id]
    );

    let worker;
    if (existingWorker.rows.length > 0) {
      const result = await db.query(
        `UPDATE workers 
         SET worker_name = $1, hostname = $2, ip_address = $3, 
             capabilities = $4, max_concurrent_tasks = $5,
             status = 'online', last_heartbeat = CURRENT_TIMESTAMP
         WHERE worker_id = $6
         RETURNING *`,
        [worker_name, hostname, ip_address, JSON.stringify(capabilities || {}),
          max_concurrent_tasks || 3, worker_id]
      );
      worker = result.rows[0];
      console.log(`Worker ${worker_id} re-registered`);
    } else {
      const result = await db.query(
        `INSERT INTO workers (worker_id, worker_name, hostname, ip_address, capabilities, max_concurrent_tasks)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [worker_id, worker_name, hostname, ip_address,
          JSON.stringify(capabilities || {}), max_concurrent_tasks || 3]
      );
      worker = result.rows[0];
      console.log(`Worker ${worker_id} registered successfully`);
    }

    res.status(201).json({
      message: 'Worker registered successfully',
      worker: worker
    });
  } catch (error) {
    console.error('Error registering worker:', error);
    res.status(500).json({ error: 'Failed to register worker' });
  }
});

app.post('/api/workers/heartbeat', requireWorkerCert, async (req, res) => {
  try {
    const { worker_id, current_load, cpu_usage, memory_usage, metadata } = req.body;

    if (!worker_id) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const result = await db.query(
      `UPDATE workers 
       SET last_heartbeat = CURRENT_TIMESTAMP, 
           status = 'online',
           current_load = $1,
           cpu_usage = $2,
           memory_usage = $3,
           metadata = $4
       WHERE worker_id = $5
       RETURNING *`,
      [current_load || 0, cpu_usage || 0, memory_usage || 0, JSON.stringify(metadata || {}), worker_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found. Please register first.' });
    }

    res.json({
      message: 'Heartbeat received',
      worker: result.rows[0]
    });
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    res.status(500).json({ error: 'Failed to process heartbeat' });
  }
});

app.get('/api/platform-token/:platform/:projectId', requireWorkerCert,async (req, res) => {
  try {
    const { platform, projectId } = req.params;

    console.log(`Fetching token for platform: ${platform}, projectId: ${projectId}`);

    if(platform == 'youtube') {
    try {
      const youtubeToken = await retrieveTokenByProjectID('youtube_token', projectId);
      res.json(youtubeToken);
    } catch (err) {
      // Not connected
      console.error('Error fetching YouTube token:', err);
    }
    } else if(platform == 'tiktok') {
    try {
      const tiktokToken = await retrieveTokenByProjectID('tiktok_token', projectId);
      res.json(tiktokToken);
    } catch (err) {
      // Not connected
      console.error('Error fetching TikTok token:', err);
    }
    } else if(platform == 'instagram') {
    try {
      const instagramAccount = await retrieveTokenByProjectID('instagram_business_account', projectId);
      res.json(instagramAccount);
      
    } catch (err) {
      // Not connected
      console.error('Error fetching Instagram account:', err);
    }
    } else if(platform == 'facebook') {
    try {
      const facebookAccounts = await retrieveTokenByProjectID('facebook_accounts', projectId);
      res.json(facebookAccounts);

    } catch (err) {
      // Not connected
      console.error('Error fetching Facebook accounts:', err);
    }
    } else if(platform == 'x') {
    try {
      const xToken = await retrieveTokenByProjectID('x_token', projectId);
      res.json(xToken);
    } catch (err) {
      // Not connected
      console.error('Error fetching X token:', err);
    }
    } else if(platform == 'reddit') {
    try {
      const redditToken = await retrieveTokenByProjectID('reddit_token', projectId);
       res.json(redditToken);
    } catch (err) {
      // Not connected
      console.error('Error fetching Reddit token:', err);
    }
    }
  } catch (error) {
    console.error('Error fetching platform token:', error);
    res.status(500).json({ error: 'Failed to fetch platform token' });
  }
});

app.get('/api/jobs/worker/:workerId', requireWorkerCert, async (req, res) => {
  try {
    const cert = req.socket.getPeerCertificate();
    const workerCN = cert.subject.CN;
    const { workerId } = req.params;

    if (workerCN !== workerId) {
      return res.status(403).json({ 
        error: 'Access denied: Worker can only access their own jobs',
        requestedWorker: workerId,
        authenticatedWorker: workerCN
      });
    }

    const { status } = req.query;

    let query = 'SELECT * FROM worker_jobs WHERE worker_id = $1';
    const params = [workerId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY priority DESC, created_at ASC';

    const result = await db.query(query, params);

    res.json({
      jobs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching worker jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/next/:workerId', requireWorkerCert, async (req, res) => {
  try {
    const cert = req.socket.getPeerCertificate();
    const workerCN = cert.subject.CN;
    const { workerId } = req.params;

    if (workerCN !== workerId) {
      return res.status(403).json({ 
        error: 'Access denied: Worker can only fetch their own jobs',
        requestedWorker: workerId,
        authenticatedWorker: workerCN
      });
    }

    let result = await db.query(
      `SELECT * FROM worker_jobs 
       WHERE worker_id = $1 
         AND status = 'assigned'
       ORDER BY priority DESC, created_at ASC
       LIMIT 1`,
      [workerId]
    );

    if (result.rows.length === 0) {
      const workerInfo = await db.query(
        'SELECT current_load, max_concurrent_tasks, capabilities FROM workers WHERE worker_id = $1',
        [workerId]
      );

      if (workerInfo.rows.length === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      const worker = workerInfo.rows[0];
      
      if (worker.current_load >= worker.max_concurrent_tasks) {
        return res.json({ job: null, message: 'Worker at capacity' });
      }

      const capabilities = worker.capabilities || {};
      const workerType = capabilities.type || 'upload';

      const pendingJobQuery = `
        SELECT * FROM worker_jobs 
        WHERE status = 'pending'
          AND worker_id IS NULL
          AND (
            (metadata->>'job_type' = $1) OR 
            ($1 = 'upload' AND metadata->>'job_type' IS NULL)
          )
        ORDER BY priority DESC, created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `;

      result = await db.query(pendingJobQuery, [workerType]);

      if (result.rows.length > 0) {
        const job = result.rows[0];
        
        const { assignJobToWorker } = await import('./utils/worker_selector.js');
        await assignJobToWorker(workerId, job.job_id);

        console.log(`✓ Worker ${workerId} claimed pending job ${job.job_id}`);
      }
    }

    if (result.rows.length === 0) {
      return res.json({ job: null });
    }

    await db.query(
      `UPDATE worker_jobs 
       SET status = 'processing', started_at = CURRENT_TIMESTAMP
       WHERE job_id = $1`,
      [result.rows[0].job_id]
    );

    res.json({
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching next job:', error);
    res.status(500).json({ error: 'Failed to fetch next job' });
  }
});

app.delete('/api/workers/:workerId', requireWorkerCert, async (req, res) => {
  try {
    const cert = req.socket.getPeerCertificate();
    const workerCN = cert.subject.CN;
    const { workerId } = req.params;

    if (workerCN !== workerId) {
      return res.status(403).json({ 
        error: 'Access denied: Worker can only fetch their own jobs',
        requestedWorker: workerId,
        authenticatedWorker: workerCN
      });
    }

    const result = await db.query(
      'DELETE FROM workers WHERE worker_id = $1 RETURNING *',
      [workerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    console.log(`Worker ${workerId} unregistered`);
    res.json({ message: 'Worker unregistered successfully' });
  } catch (error) {
    console.error('Error unregistering worker:', error);
    res.status(500).json({ error: 'Failed to unregister worker' });
  }
});

app.patch('/api/jobs/:jobId/status', requireWorkerCert, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, error_message, result_data } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const jobResult = await db.query(
      'SELECT worker_id FROM worker_jobs WHERE job_id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const workerId = jobResult.rows[0].worker_id;

    const updateQuery = error_message
      ? `UPDATE worker_jobs 
         SET status = $1, completed_at = CURRENT_TIMESTAMP, error_message = $2, metadata = metadata || $3
         WHERE job_id = $4
         RETURNING *`
      : `UPDATE worker_jobs 
         SET status = $1, completed_at = CURRENT_TIMESTAMP, metadata = metadata || $2
         WHERE job_id = $3
         RETURNING *`;

    const params = error_message
      ? [status, error_message, JSON.stringify({ result: result_data }), jobId]
      : [status, JSON.stringify({ result: result_data }), jobId];

    const result = await db.query(updateQuery, params);

    if (['completed', 'failed'].includes(status)) {
      const { releaseWorkerFromJob } = await import('./utils/worker_selector.js');
      await releaseWorkerFromJob(workerId, jobId, status, error_message);
    }

    res.json({
      message: 'Job status updated',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

https.createServer(options, app).listen(3001, () => {
  console.log('Worker server running on :3001');
  
  startJobScheduler(30000);
});