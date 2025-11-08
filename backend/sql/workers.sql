CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  worker_id VARCHAR(255) UNIQUE NOT NULL,
  worker_name VARCHAR(255),
  hostname VARCHAR(255),
  ip_address VARCHAR(45),
  status VARCHAR(50) DEFAULT 'online',
  last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  capabilities JSONB DEFAULT '{}'::jsonb,
  current_load INTEGER DEFAULT 0,
  max_concurrent_tasks INTEGER DEFAULT 3
);

CREATE INDEX IF NOT EXISTS idx_worker_id ON workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_last_heartbeat ON workers(last_heartbeat);

CREATE TABLE IF NOT EXISTS worker_jobs (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(255) UNIQUE NOT NULL,
  worker_id VARCHAR(255) REFERENCES workers(worker_id) ON DELETE SET NULL,
  video_id BIGINT,
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_job_id ON worker_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_status ON worker_jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_worker ON worker_jobs(worker_id);
CREATE INDEX IF NOT EXISTS idx_job_video ON worker_jobs(video_id);

CREATE OR REPLACE FUNCTION mark_inactive_workers_offline()
RETURNS void AS $$
BEGIN
  UPDATE workers
  SET status = 'offline'
  WHERE status = 'online'
    AND last_heartbeat < NOW() - INTERVAL '2 minutes';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reassign_jobs_from_offline_workers()
RETURNS void AS $$
BEGIN
  UPDATE worker_jobs
  SET worker_id = NULL, status = 'pending'
  WHERE status = 'processing'
    AND worker_id IN (
      SELECT worker_id FROM workers WHERE status = 'offline'
    );
END;
$$ LANGUAGE plpgsql;
