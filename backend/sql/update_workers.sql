ALTER TABLE workers
ADD COLUMN cpu_usage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN memory_usage DECIMAL(5,2) DEFAULT 0;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS preferred_worker_id VARCHAR(255);
ALTER TABLE projects ADD CONSTRAINT fk_preferred_worker 
  FOREIGN KEY (preferred_worker_id) REFERENCES workers(worker_id) ON DELETE SET NULL;
