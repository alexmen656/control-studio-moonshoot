import https from 'https';
import fs from 'fs';
import express from 'express';
import * as db from './utils/db.js'
import { startJobScheduler } from './utils/job_scheduler.js';
import { SignJWT } from 'jose';
import { CompactEncrypt } from 'jose';
import { importPKCS8, importSPKI } from 'jose';
import { createHash } from 'crypto';
import { retrieveTokenByProjectID } from './utils/token_manager.js';
import { startAnalyticsScheduler } from './utils/analytics_scheduler.js';
import { startPublishScheduler } from './utils/publish_scheduler.js';

const vpsPrivateKeyPem = fs.readFileSync('./keys/vps/vps-private.pem', 'utf8');
const workerPublicKeyPem = fs.readFileSync('./keys/worker/worker-public.pem', 'utf8');

async function storeAnalyticsData(resultData) {
  const { analytics_data, project_id, platform, task_type } = resultData;

  if (!analytics_data || !project_id || !platform) {
    console.warn('⚠️ Missing required analytics data fields');
    return;
  }

  try {
    const channelInsertQuery = `
      INSERT INTO channel_analytics (
        project_id, platform, 
        followers, subscribers,
        total_videos, total_posts, total_tweets,
        total_views, total_likes, total_comments, total_shares,
        total_retweets, total_replies, total_upvotes,
        engagement_rate, average_score, karma,
        total_reach, total_impressions,
        metadata, collected_at
      ) VALUES (
        $1, $2, 
        $3, $4,
        $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17,
        $18, $19,
        $20, CURRENT_TIMESTAMP
      ) 
      ON CONFLICT (project_id, platform, collected_at) 
      DO UPDATE SET
        followers = EXCLUDED.followers,
        subscribers = EXCLUDED.subscribers,
        total_videos = EXCLUDED.total_videos,
        total_posts = EXCLUDED.total_posts,
        total_tweets = EXCLUDED.total_tweets,
        total_views = EXCLUDED.total_views,
        total_likes = EXCLUDED.total_likes,
        total_comments = EXCLUDED.total_comments,
        total_shares = EXCLUDED.total_shares,
        total_retweets = EXCLUDED.total_retweets,
        total_replies = EXCLUDED.total_replies,
        total_upvotes = EXCLUDED.total_upvotes,
        engagement_rate = EXCLUDED.engagement_rate,
        average_score = EXCLUDED.average_score,
        karma = EXCLUDED.karma,
        total_reach = EXCLUDED.total_reach,
        total_impressions = EXCLUDED.total_impressions,
        metadata = EXCLUDED.metadata
      RETURNING id
    `;

    const channelResult = await db.query(channelInsertQuery, [
      project_id,
      platform,
      analytics_data.followers || analytics_data.subscribers || 0,
      analytics_data.subscribers || 0,
      analytics_data.total_videos || 0,
      analytics_data.total_posts || 0,
      analytics_data.total_tweets || 0,
      analytics_data.total_views || 0,
      analytics_data.total_likes || 0,
      analytics_data.total_comments || 0,
      analytics_data.total_shares || 0,
      analytics_data.total_retweets || 0,
      analytics_data.total_replies || 0,
      analytics_data.total_upvotes || 0,
      parseFloat(analytics_data.engagement_rate) || 0,
      parseFloat(analytics_data.average_score) || 0,
      analytics_data.karma || 0,
      analytics_data.total_reach || 0,
      analytics_data.total_impressions || 0,
      JSON.stringify({
        task_type,
        raw_data: analytics_data
      })
    ]);

    const channelAnalyticsId = channelResult.rows[0].id;

    if (analytics_data.videos && Array.isArray(analytics_data.videos)) {
      for (const video of analytics_data.videos) {
        await storeContentAnalytics(channelAnalyticsId, project_id, platform, video);
      }
    }

    if (analytics_data.posts && Array.isArray(analytics_data.posts)) {
      for (const post of analytics_data.posts) {
        await storeContentAnalytics(channelAnalyticsId, project_id, platform, post);
      }
    }

    if (analytics_data.tweets && Array.isArray(analytics_data.tweets)) {
      for (const tweet of analytics_data.tweets) {
        await storeContentAnalytics(channelAnalyticsId, project_id, platform, tweet);
      }
    }

    console.log(`✅ Stored analytics for project ${project_id}, platform ${platform}`);
  } catch (error) {
    console.error('Error storing analytics data:', error);
    throw error;
  }
}

async function storeContentAnalytics(channelAnalyticsId, projectId, platform, content) {
  try {
    const contentInsertQuery = `
      INSERT INTO content_analytics (
        channel_analytics_id, project_id, platform,
        content_id, content_type, title,
        views, likes, comments, shares,
        retweets, replies, upvotes, score,
        metadata, collected_at
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, CURRENT_TIMESTAMP
      )
      ON CONFLICT (project_id, platform, content_id, collected_at)
      DO UPDATE SET
        views = EXCLUDED.views,
        likes = EXCLUDED.likes,
        comments = EXCLUDED.comments,
        shares = EXCLUDED.shares,
        retweets = EXCLUDED.retweets,
        replies = EXCLUDED.replies,
        upvotes = EXCLUDED.upvotes,
        score = EXCLUDED.score,
        metadata = EXCLUDED.metadata
    `;

    await db.query(contentInsertQuery, [
      channelAnalyticsId,
      projectId,
      platform,
      content.id,
      content.platform === 'youtube' ? 'video' : (content.platform === 'x' ? 'tweet' : 'post'),
      content.title || '',
      content.views || 0,
      content.likes || 0,
      content.comments || 0,
      content.shares || 0,
      content.retweets || 0,
      content.replies || 0,
      content.upvotes || 0,
      content.score || 0,
      JSON.stringify(content)
    ]);
  } catch (error) {
    console.error(`Error storing content analytics for ${content.id}:`, error);
  }
}

async function storeCommentsData(resultData) {
  const { comments_data, project_id, platform, task_type } = resultData;

  if (!comments_data || !project_id || !platform) {
    console.warn('⚠️ Missing required comments data fields');
    return;
  }

  try {
    const commentInsertQuery = `
      INSERT INTO video_comments (
        project_id, platform,
        total_videos, total_comments,
        metadata, collected_at
      ) VALUES (
        $1, $2,
        $3, $4,
        $5, CURRENT_TIMESTAMP
      )
      ON CONFLICT (project_id, platform, collected_at)
      DO UPDATE SET
        total_videos = EXCLUDED.total_videos,
        total_comments = EXCLUDED.total_comments,
        metadata = EXCLUDED.metadata
      RETURNING id
    `;

    const commentResult = await db.query(commentInsertQuery, [
      project_id,
      platform,
      comments_data.total_videos || 0,
      comments_data.total_comments || 0,
      JSON.stringify({
        task_type,
        raw_data: comments_data
      })
    ]);

    const commentCollectionId = commentResult.rows[0].id;

    // Store individual video comments
    if (comments_data.videos && Array.isArray(comments_data.videos)) {
      for (const video of comments_data.videos) {
        await storeVideoComments(commentCollectionId, project_id, platform, video);
      }
    }

    // Store individual post comments (for Facebook/Instagram)
    if (comments_data.posts && Array.isArray(comments_data.posts)) {
      for (const post of comments_data.posts) {
        await storeVideoComments(commentCollectionId, project_id, platform, post);
      }
    }

    console.log(`✅ Stored comments for project ${project_id}, platform ${platform}`);
  } catch (error) {
    console.error('Error storing comments data:', error);
    throw error;
  }
}

async function storeVideoComments(commentCollectionId, projectId, platform, videoData) {
  try {
    const videoCommentInsertQuery = `
      INSERT INTO video_comment_details (
        comment_collection_id, project_id, platform,
        video_id, video_title, total_comments,
        comment_data, collected_at
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6,
        $7, CURRENT_TIMESTAMP
      )
      ON CONFLICT (project_id, platform, video_id, collected_at)
      DO UPDATE SET
        total_comments = EXCLUDED.total_comments,
        comment_data = EXCLUDED.comment_data
    `;

    await db.query(videoCommentInsertQuery, [
      commentCollectionId,
      projectId,
      platform,
      videoData.videoId || videoData.postId || videoData.mediaId || '',
      videoData.videoTitle || videoData.postTitle || videoData.mediaTitle || '',
      videoData.commentCount || 0,
      JSON.stringify(videoData.comments || [])
    ]);
  } catch (error) {
    console.error(`Error storing video comments for ${videoData.videoId}:`, error);
  }
}

const vpsPrivateKey = await importPKCS8(vpsPrivateKeyPem, 'ES256');
const workerPublicKey = await importSPKI(workerPublicKeyPem, 'RSA-OAEP');

function getCertificateThumbprint(cert) {
  const hash = createHash('sha256').update(cert).digest();
  return Buffer.from(hash).toString('base64url');
}

async function createSignedToken(workerId, certThumbprint) {
  const payload = {
    sub: workerId,
    iss: 'http://localhost:3001',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    cnf: {
      'x5t#S256': certThumbprint
    }
  };

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .sign(vpsPrivateKey);

  return jwt;
}

async function createEncryptedToken(workerId, certThumbprint) {
  const signedToken = await createSignedToken(workerId, certThumbprint);

  const jweToken = await new CompactEncrypt(
    new TextEncoder().encode(signedToken)
  )
    .setProtectedHeader({
      alg: 'RSA-OAEP',
      enc: 'A256GCM'
    })
    .encrypt(workerPublicKey);

  return jweToken;
}

const app = express();
app.use(express.json());

const options = {
  key: fs.readFileSync('certs/vps.key'),
  cert: fs.readFileSync('certs/vps.crt'),
  ca: fs.readFileSync('certs/ca.crt'),
  requestCert: true,
  rejectUnauthorized: true,
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
};

const requireWorkerCert = (req, res, next) => {
  if (!req.socket.authorized) {
    return res.status(401).json({ error: 'Invalid worker certificate' });
  }

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

app.post('/api/platform-token/:platform/:projectId', requireWorkerCert, async (req, res) => {
  try {
    const { platform, projectId } = req.params;
    console.log(`Fetching token for platform: ${platform}, projectId: ${projectId}`);

    const clientCert = req.socket.getPeerCertificate();
    const certThumbprint = getCertificateThumbprint(
      clientCert.raw || clientCert.cert
    );

    if (platform == 'youtube') {
      try {
        const youtubeToken = await retrieveTokenByProjectID('youtube_token', projectId);
        const youtubeChannelInfo = await retrieveTokenByProjectID('youtube_channel_info', projectId);

        const token = {
          access_token: youtubeToken.access_token,
          refresh_token: youtubeToken.refresh_token,
          channelId: youtubeChannelInfo?.channelId || null
        };

        const encryptedToken = await createEncryptedToken(token, certThumbprint);
        res.json(encryptedToken);
      } catch (err) {
        // Not connected
        console.error('Error fetching YouTube token:', err);
        res.status(401).json({ error: 'YouTube token not found or expired' });
      }
    } else if (platform == 'tiktok') {
      try {
        const tiktokToken = await retrieveTokenByProjectID('tiktok_token', projectId);

        const token = {
          access_token: tiktokToken.access_token,
          refresh_token: tiktokToken.refresh_token
        };

        const encryptedToken = await createEncryptedToken(token, certThumbprint);
        res.json(encryptedToken);
      } catch (err) {
        // Not connected
        console.error('Error fetching TikTok token:', err);
        res.status(401).json({ error: 'TikTok token not found or expired' });
      }
    } else if (platform == 'instagram') {
      try {
        const instagramAccount = await retrieveTokenByProjectID('instagram_business_account', projectId);
        console.log('Instagram Account:', instagramAccount);
        const facebook_accounts_for_instagram = await retrieveTokenByProjectID('facebook_accounts_for_instagram', projectId);

        const token = {
          instagramUserId: instagramAccount.instagram_business_account?.id || instagramAccount.id,
          accessToken: facebook_accounts_for_instagram.data[0].access_token
        };

        const encryptedToken = await createEncryptedToken(token, certThumbprint);
        res.json(encryptedToken);

      } catch (err) {
        // Not connected
        console.error('Error fetching Instagram account:', err);
        res.status(401).json({ error: 'Instagram account not found or not connected' });
      }
    } else if (platform == 'facebook') {
      try {
        const facebookAccounts = await retrieveTokenByProjectID('facebook_accounts', projectId);

        const token = {
          access_token: facebookAccounts.data[0].access_token,
          pageId: facebookAccounts.data[0].id
        };

        const encryptedToken = await createEncryptedToken(token, certThumbprint);
        res.json(encryptedToken);
      } catch (err) {
        // Not connected
        console.error('Error fetching Facebook accounts:', err);
        res.status(401).json({ error: 'Facebook account not found or not connected' });
      }
    } else if (platform == 'x') {
      try {
        const xToken = await retrieveTokenByProjectID('x_token', projectId);
        const xUserInfo = await retrieveTokenByProjectID('x_user_info', projectId);

        const token = {
          access_token: xToken.access_token,
          refresh_token: xToken.refresh_token,
          userId: xUserInfo?.id || null
        };

        const encryptedToken = await createEncryptedToken(token, certThumbprint);
        res.json(encryptedToken);
      } catch (err) {
        // Not connected
        console.error('Error fetching X token:', err);
        res.status(401).json({ error: 'X token not found or expired' });
      }
    } else if (platform == 'reddit') {
      try {
        const redditToken = await retrieveTokenByProjectID('reddit_token', projectId);
        const redditUserInfo = await retrieveTokenByProjectID('reddit_user_info', projectId);

        const token = {
          access_token: redditToken.access_token,
          refresh_token: redditToken.refresh_token,
          username: redditUserInfo?.name || 'unknown'
        };

        const encryptedToken = await createEncryptedToken(token, certThumbprint);
        res.json(encryptedToken);
      } catch (err) {
        // Not connected
        console.error('Error fetching Reddit token:', err);
        res.status(401).json({ error: 'Reddit token not found or expired' });
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

    result.rows.forEach(async (row) => {
      if (row.video_id) {
        const video = await db.getVideoById(row.video_id)

        if (!video) {
          return res.status(404).json({ error: 'Video not found' })
        }

        if (video.project_id) {
          const accessResult = await db.query(
            'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
            [video.project_id, req.user.id]
          );

          if (accessResult.rows.length === 0) {
            return res.status(404).json({ error: 'Job unavailable' });
          }
        }

        if (video.advancedOptions && row.platform) {
          const platformOptions = video.advancedOptions[row.platform];
          if (platformOptions) {
            Object.assign(video, platformOptions);
          }

          delete video.advancedOptions;
        }

        row.video = video;
      }
    });

    console.log("Responded with - 1: ", result.rows)
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

    if (result.rows.length > 0) {
      const row = result.rows[0];

      if (row.video_id) {
        const video = await db.getVideoById(row.video_id);

        if (!video) {
          return res.status(404).json({ error: 'Video not found' });
        }

        if (video.project_id) {
          const accessResult = await db.query(
            'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
            [video.project_id, req.user.id]
          );

          if (accessResult.rows.length === 0) {
            return res.status(404).json({ error: 'Job unavailable' });
          }
        }

        if (video.advancedOptions && row.platform) {
          const platformOptions = video.advancedOptions[row.platform];
          if (platformOptions) {
            Object.assign(video, platformOptions);
          }

          delete video.advancedOptions;
        }

        row.video = video;
      }
    }

    console.log("Responded with - 2: ", result.rows)

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

    if (status === 'completed' && result_data?.analytics_data) {
      try {
        await storeAnalyticsData(result_data);
        console.log(`✅ Analytics data stored for job ${jobId}`);
      } catch (analyticsError) {
        console.error(`❌ Error storing analytics data for job ${jobId}:`, analyticsError);
      }
    }

    if (status === 'completed' && result_data?.comments_data) {
      try {
        await storeCommentsData(result_data);
        console.log(`✅ Comments data stored for job ${jobId}`);
      } catch (commentsError) {
        console.error(`❌ Error storing comments data for job ${jobId}:`, commentsError);
      }
    }

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
  //startAnalyticsScheduler(300000)
  console.log('Analytics scheduler started (5-minute intervals)');

  startPublishScheduler();
  console.log('Publish scheduler started (30-second intervals)');
});