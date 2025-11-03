import axios from 'axios';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { compactDecrypt } from 'jose';
import { jwtVerify } from 'jose';
import { importPKCS8, importSPKI } from 'jose';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';

//platforms
import { uploadToTikTok } from './platforms/tiktok.js';
import { uploadToYouTube } from './platforms/youtube.js';
import { uploadToInstagram } from './platforms/instagram.js';
import { uploadToFacebook } from './platforms/facebook.js';
import { uploadToX } from './platforms/x.js';
import { uploadToReddit } from './platforms/reddit.js';

//utils
import { getCPUUsage, getMemoryUsage } from './utils/systemMetrics.js';

dotenv.config();

class UploadWorker {
  constructor() {
    this.workerId = process.env.WORKER_ID || `worker-${uuidv4()}`;
    this.workerName = process.env.WORKER_NAME || `Worker-${os.hostname()}`;
    this.backendUrl = process.env.BACKEND_URL || 'https://localhost:3001';
    this.heartbeatInterval = parseInt(process.env.HEARTBEAT_INTERVAL || '30000');
    this.jobPollInterval = parseInt(process.env.JOB_POLL_INTERVAL || '5000');
    this.maxConcurrentTasks = parseInt(process.env.MAX_CONCURRENT_TASKS || '3');

    this.isRegistered = false;
    this.isRunning = false;
    this.heartbeatTimer = null;
    this.jobPollTimer = null;
    this.currentLoad = 0;
    this.activeJobs = new Map();

    this.uploadToTikTok = uploadToTikTok.bind(this);
    this.uploadToYouTube = uploadToYouTube.bind(this);
    this.uploadToInstagram = uploadToInstagram.bind(this);
    this.uploadToFacebook = uploadToFacebook.bind(this);
    this.uploadToX = uploadToX.bind(this);
    this.uploadToReddit = uploadToReddit.bind(this);

    this.capabilities = {
      platforms: ['youtube', 'tiktok', 'instagram', 'facebook', 'x', 'reddit'],
      maxFileSize: 500 * 1024 * 1024,
      supportedFormats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
    };

    this.httpsAgent = new https.Agent({
      cert: fs.readFileSync(`certs/worker-${this.workerId}.crt`),
      key: fs.readFileSync(`certs/worker-${this.workerId}.key`),
      ca: fs.readFileSync('certs/ca.crt'),
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3'
    });

    this.workerPrivateKeyPem = fs.readFileSync('keys/private.pem', 'utf8');
    this.vpsPublicKeyPem = fs.readFileSync('keys/vps-public.pem', 'utf8');
  }

  async register() {
    try {
      console.log(`Registering worker ${this.workerId}...`);

      const response = await axios.post(`${this.backendUrl}/api/workers/register`, {
        worker_id: `worker-${this.workerId}`,
        worker_name: this.workerName,
        hostname: os.hostname(),
        capabilities: this.capabilities,
        max_concurrent_tasks: this.maxConcurrentTasks
      }, { httpsAgent: this.httpsAgent });

      this.isRegistered = true;
      console.log(`✅ Worker registered successfully!`);
      console.log(`   ID: worker-${this.workerId}`);
      console.log(`   Name: ${this.workerName}`);
      console.log(`   Hostname: ${os.hostname()}`);
      console.log(`   Backend: ${this.backendUrl}`);

      return response.data;
    } catch (error) {
      console.error(`Failed to register worker:`, error.message);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Error: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }



  async sendHeartbeat() {
    if (!this.isRegistered) {
      console.warn('⚠️ Worker not registered, skipping heartbeat');
      return;
    }

    try {
      const cpuUsage = getCPUUsage();
      const memoryUsage = getMemoryUsage();

      const metadata = {
        uptime: process.uptime(),
        memory: {
          process_used: process.memoryUsage().heapUsed,
          process_total: process.memoryUsage().heapTotal,
          system_used: memoryUsage.used,
          system_free: memoryUsage.free,
          system_total: memoryUsage.total,
          usage_percent: memoryUsage.usagePercent
        },
        cpu: {
          cores: os.cpus().length,
          usage_percent: cpuUsage,
          model: os.cpus()[0].model
        },
        platform: os.platform(),
        arch: os.arch(),
        load_average: os.loadavg()
      };

      await axios.post(`${this.backendUrl}/api/workers/heartbeat`, {
        worker_id: `worker-${this.workerId}`,
        current_load: this.currentLoad,
        cpu_usage: cpuUsage,
        memory_usage: memoryUsage.usagePercent,
        metadata: metadata
      }, { httpsAgent: this.httpsAgent });

      console.log(`💓 Heartbeat sent [Jobs: ${this.currentLoad}/${this.maxConcurrentTasks} | CPU: ${cpuUsage}% | RAM: ${memoryUsage.usagePercent}%]`);
    } catch (error) {
      console.error(`❌ Failed to send heartbeat:`, error.message);

      if (error.response?.status === 404) {
        console.log('🔄 Worker not found in backend, attempting re-registration...');
        this.isRegistered = false;
        await this.register();
      }
    }
  }

  startHeartbeat() {
    console.log(`Starting heartbeat (interval: ${this.heartbeatInterval}ms)`);

    this.sendHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      console.log('💓 Heartbeat stopped');
    }
  }

  async pollForJobs() {
    if (!this.isRegistered || !this.isRunning) {
      return;
    }

    if (this.currentLoad >= this.maxConcurrentTasks) {
      return;
    }

    try {
      const response = await axios.get(`${this.backendUrl}/api/jobs/next/worker-${this.workerId}`, { httpsAgent: this.httpsAgent });

      if (response.data.job) {
        const job = response.data.job;
        console.log(`\n📦 Received job: ${job.job_id}`);
        console.log(`   Platform: ${job.platform}`);
        console.log(`   Video ID: ${job.video_id}`);

        this.currentLoad++;
        this.activeJobs.set(job.job_id, job);

        this.processJob(job).catch(error => {
          console.error(`Error processing job ${job.job_id}:`, error);
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(`Error polling for jobs:`, error.message);
      }
    }
  }

  startJobPolling() {
    console.log(`📋 Starting job polling (interval: ${this.jobPollInterval}ms)`);

    this.pollForJobs();

    this.jobPollTimer = setInterval(() => {
      this.pollForJobs();
    }, this.jobPollInterval);
  }

  stopJobPolling() {
    if (this.jobPollTimer) {
      clearInterval(this.jobPollTimer);
      this.jobPollTimer = null;
      console.log('📋 Job polling stopped');
    }
  }

  async updateJobStatus(jobId, status, errorMessage = null, resultData = null) {
    try {
      await axios.patch(`${this.backendUrl}/api/jobs/${jobId}/status`, {
        status,
        error_message: errorMessage,
        result_data: resultData
      }, { httpsAgent: this.httpsAgent });

      console.log(`✓ Job ${jobId} status updated: ${status}`);
    } catch (error) {
      console.error(`Failed to update job status:`, error.message);
    }
  }

  async unregister() {
    try {
      console.log(`🔄 Unregistering worker ${this.workerId}...`);

      await axios.delete(`${this.backendUrl}/api/workers/worker-${this.workerId}`, { httpsAgent: this.httpsAgent });

      this.isRegistered = false;
      console.log('✅ Worker unregistered successfully');
    } catch (error) {
      console.error('❌ Failed to unregister worker:', error.message);
    }
  }

  async start() {
    console.log('🚀 Starting Upload Worker...');
    console.log('================================');

    try {
      await this.register();
      this.startHeartbeat();

      this.isRunning = true;
      console.log('================================');
      console.log('✅ Worker is now running and ready!');
      console.log('   Press Ctrl+C to stop');
      console.log('================================\n');

      this.startJobPolling();

    } catch (error) {
      console.error('❌ Failed to start worker:', error.message);
      process.exit(1);
    }
  }

  async stop() {
    console.log('\n🛑 Stopping worker...');

    this.isRunning = false;
    this.stopHeartbeat();
    this.stopJobPolling();

    if (this.activeJobs.size > 0) {
      console.log(`⏳ Waiting for ${this.activeJobs.size} active job(s) to complete...`);
      const timeout = 30000;
      const startTime = Date.now();

      while (this.activeJobs.size > 0 && (Date.now() - startTime) < timeout) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (this.activeJobs.size > 0) {
        console.log(`⚠️  Force stopping with ${this.activeJobs.size} job(s) still active`);
      }
    }

    await this.unregister();

    console.log('✅ Worker stopped successfully');
    process.exit(0);
  }

  async processJob(job) {
    console.log(`\n Processing job: ${job.job_id}`);
    console.log(`   Platform: ${job.platform}`);
    console.log(`   Video: ${job.metadata?.video_title || job.video_id}`);

    try {
      console.log(`   Starting upload to ${job.platform}...`);
      const uploadTime = 2000 + Math.random() * 3000;
      await new Promise(resolve => setTimeout(resolve, uploadTime));

      const platform = job.platform;
      const projectId = job.metadata.project_id;

      const tokenResponse = await axios.post(
        `${this.backendUrl}/api/platform-token/${platform}/${projectId}`,
        {},
        { httpsAgent: this.httpsAgent }
      );

      const workerPrivateKey = await importPKCS8(this.workerPrivateKeyPem, 'RSA-OAEP');
      const { plaintext } = await compactDecrypt(tokenResponse.data, workerPrivateKey);
      const decrypted = new TextDecoder().decode(plaintext);
      const vpsPublicKey = await importSPKI(this.vpsPublicKeyPem, 'ES256');
      const { payload } = await jwtVerify(decrypted, vpsPublicKey);

      if (payload) {
        switch (platform) {
          case 'youtube':
            return await this.uploadToYouTube(payload, job.metadata, job);
          case 'tiktok':
            return await this.uploadToTikTok(payload, job.metadata, job);
          case 'instagram':
            return await this.uploadToInstagram(payload, job.metadata, job);
          case 'facebook':
            return await this.uploadToFacebook(payload, job.metadata, job);
          case 'x':
            return await this.uploadToX(payload, job.metadata, job);
          case 'reddit':
            return await this.uploadToReddit(payload, job.metadata, job);
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }
      }

    } catch (error) {
      console.error(`❌ Failed to process job ${job.job_id}:`, error.message);

      await this.updateJobStatus(
        job.job_id,
        'failed',
        error.message,
        { platform: job.platform, failed_at: new Date().toISOString() }
      );
    } finally {
      this.activeJobs.delete(job.job_id);
      this.currentLoad = Math.max(0, this.currentLoad - 1);
      console.log(`📊 Current load: ${this.currentLoad}/${this.maxConcurrentTasks}\n`);
    }
  }
}

const worker = new UploadWorker();

process.on('SIGINT', async () => {
  await worker.stop();
});

process.on('SIGTERM', async () => {
  await worker.stop();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  worker.stop();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  worker.stop();
});

worker.start();