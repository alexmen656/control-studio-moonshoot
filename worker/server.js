import axios from 'axios';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();


//logs

/*
> control-studio-worker@1.0.0 start
> node server.js

🚀 Starting Upload Worker...
================================
🔄 Registering worker worker-a8ca79b1-bc31-4e4d-af24-e0d1afc6d1a9...
❌ Failed to register worker: getaddrinfo ENOTFOUND backend
❌ Failed to start worker: getaddrinfo ENOTFOUND backend
(base) alexpolan@Alexs-MacBook-Pro control-studio-moonshoot-1 % 

solutionm:host.docker.internal

*/

class UploadWorker {
  constructor() {
    this.workerId = process.env.WORKER_ID || `worker-${uuidv4()}`;
    this.workerName = process.env.WORKER_NAME || `Worker-${os.hostname()}`;
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:6709';
    this.heartbeatInterval = parseInt(process.env.HEARTBEAT_INTERVAL || '30000');
    this.maxConcurrentTasks = parseInt(process.env.MAX_CONCURRENT_TASKS || '3');
    
    this.isRegistered = false;
    this.isRunning = false;
    this.heartbeatTimer = null;
    this.currentLoad = 0;
    
    this.capabilities = {
      platforms: ['youtube', 'tiktok', 'instagram', 'facebook', 'x', 'reddit'],
      maxFileSize: 500 * 1024 * 1024,
      supportedFormats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
    };
  }

  async register() {
    try {
      console.log(`Registering worker ${this.workerId}...`);
      
      const response = await axios.post(`${this.backendUrl}/api/workers/register`, {
        worker_id: this.workerId,
        worker_name: this.workerName,
        hostname: os.hostname(),
        capabilities: this.capabilities,
        max_concurrent_tasks: this.maxConcurrentTasks
      });

      this.isRegistered = true;
      console.log(`✅ Worker registered successfully!`);
      console.log(`   ID: ${this.workerId}`);
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
      const metadata = {
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          free: os.freemem(),
          total_system: os.totalmem()
        },
        cpu: os.cpus().length,
        platform: os.platform(),
        arch: os.arch()
      };

      await axios.post(`${this.backendUrl}/api/workers/heartbeat`, {
        worker_id: this.workerId,
        current_load: this.currentLoad,
        metadata: metadata
      });

      console.log(`Heartbeat sent [Load: ${this.currentLoad}/${this.maxConcurrentTasks}]`);
    } catch (error) {
      console.error(`Failed to send heartbeat:`, error.message);
      
      // If heartbeat fails multiple times, try to re-register
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

  async unregister() {
    try {
      console.log(`🔄 Unregistering worker ${this.workerId}...`);
      
      await axios.delete(`${this.backendUrl}/api/workers/${this.workerId}`);
      
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
      
      // TODO: Start polling for jobs
      // this.startJobPolling();
      
    } catch (error) {
      console.error('❌ Failed to start worker:', error.message);
      process.exit(1);
    }
  }

  async stop() {
    console.log('\n🛑 Stopping worker...');
    
    this.isRunning = false;
    this.stopHeartbeat();
    
    // TODO: Complete current jobs before stopping
    
    await this.unregister();
    
    console.log('✅ Worker stopped successfully');
    process.exit(0);
  }

  // Placeholder for future job processing
  async processJob(job) {
    console.log(`📦 Processing job: ${job.job_id}`);
    // TODO: Implement actual upload logic
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
