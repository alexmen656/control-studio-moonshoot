-- Reelmia Complete Database Setup
-- This file contains all tables with all modifications consolidated
-- Execute this file for a fresh database setup

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    -- 2FA columns
    totp_secret VARCHAR(255),
    totp_enabled BOOLEAN DEFAULT FALSE,
    backup_codes TEXT[],
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_totp_enabled ON users(totp_enabled) WHERE totp_enabled = TRUE;

-- ============================================================================
-- PASSKEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS passkeys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    device_name VARCHAR(255),
    transports TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON passkeys(credential_id);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    color1 VARCHAR(7) NOT NULL,
    color2 VARCHAR(7) NOT NULL,
    user_id INTEGER NOT NULL,
    region_id VARCHAR(50) DEFAULT 'austria-east-1',
    preferred_worker_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_region_id ON projects(region_id);

-- Insert default project for all existing users
INSERT INTO projects (name, initials, color1, color2, user_id)
SELECT 'Testproject', 'TP', '#ef4444', '#ec4899', id
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE user_id = users.id
);

-- ============================================================================
-- PROJECT USERS TABLE (Many-to-many relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_users (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Insert the project owner as a member for all existing projects
INSERT INTO project_users (project_id, user_id)
SELECT id, user_id FROM projects
WHERE NOT EXISTS (
    SELECT 1 FROM project_users 
    WHERE project_users.project_id = projects.id 
    AND project_users.user_id = projects.user_id
);

CREATE INDEX IF NOT EXISTS idx_project_users_project_id ON project_users(project_id);
CREATE INDEX IF NOT EXISTS idx_project_users_user_id ON project_users(user_id);

-- ============================================================================
-- WORKERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    worker_id VARCHAR(255) UNIQUE NOT NULL,
    worker_name VARCHAR(255),
    hostname VARCHAR(255),
    ip_address VARCHAR(45),
    status VARCHAR(50) DEFAULT 'online',
    cpu_usage DECIMAL(5,2) DEFAULT 0,
    memory_usage DECIMAL(5,2) DEFAULT 0,
    current_load INTEGER DEFAULT 0,
    max_concurrent_tasks INTEGER DEFAULT 3,
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    capabilities JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_worker_id ON workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_last_heartbeat ON workers(last_heartbeat);

-- Add foreign key constraint to projects table after workers table is created
ALTER TABLE projects ADD CONSTRAINT fk_preferred_worker 
    FOREIGN KEY (preferred_worker_id) REFERENCES workers(worker_id) ON DELETE SET NULL;

-- ============================================================================
-- WORKER JOBS TABLE
-- ============================================================================
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

-- ============================================================================
-- WORKER FUNCTIONS
-- ============================================================================
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

-- ============================================================================
-- VIDEOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(500),
    duration VARCHAR(20) DEFAULT '0:00',
    size VARCHAR(50),
    size_bytes BIGINT,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'awaiting-details',
    progress INTEGER DEFAULT 100,
    views INTEGER DEFAULT 0,
    path TEXT NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP,
    published_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_upload_date ON videos(upload_date);
CREATE INDEX IF NOT EXISTS idx_videos_scheduled_date ON videos(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_videos_project_id ON videos(project_id);

-- ============================================================================
-- VIDEO PLATFORMS TABLE (Many-to-many relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_platforms (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) REFERENCES videos(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_video_platforms_video_id ON video_platforms(video_id);

-- ============================================================================
-- VIDEO TAGS TABLE (Many-to-many relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_tags (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) REFERENCES videos(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_video_tags_video_id ON video_tags(video_id);

-- ============================================================================
-- PUBLISH STATUS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS publish_status (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) REFERENCES videos(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', or ISO timestamp for success
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_publish_status_video_id ON publish_status(video_id);

-- ============================================================================
-- USER API TOKENS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_api_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    service_name VARCHAR(50) NOT NULL,
    token_content TEXT NOT NULL,
    token_iv CHAR(32) NOT NULL,
    token_tag CHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, service_name, project_id)
);

CREATE INDEX IF NOT EXISTS idx_user_api_tokens_project_id ON user_api_tokens(project_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_service ON user_api_tokens(project_id, service_name);

-- ============================================================================
-- OAUTH STATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS oauth_states (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    project_id INTEGER NOT NULL,
    state_token VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '15 minutes'
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
