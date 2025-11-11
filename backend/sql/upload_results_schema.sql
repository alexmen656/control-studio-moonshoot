CREATE TABLE IF NOT EXISTS upload_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    job_id VARCHAR(100) NOT NULL,
    video_id VARCHAR(50) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    platform_id VARCHAR(255) NOT NULL,
    platform_response JSONB DEFAULT '{}'::jsonb,
    uploaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(job_id, platform),
    UNIQUE(video_id, platform),
    CONSTRAINT fk_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_upload_results_project_id ON upload_results(project_id);
CREATE INDEX IF NOT EXISTS idx_upload_results_video_id ON upload_results(video_id);
CREATE INDEX IF NOT EXISTS idx_upload_results_platform ON upload_results(platform);
CREATE INDEX IF NOT EXISTS idx_upload_results_job_id ON upload_results(job_id);
CREATE INDEX IF NOT EXISTS idx_upload_results_created_at ON upload_results(created_at);