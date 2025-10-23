-- Control Studio Database Schema

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(500),
    duration VARCHAR(20) DEFAULT '0:00',
    size VARCHAR(50),
    size_bytes BIGINT,
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

-- Video platforms table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS video_platforms (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) REFERENCES videos(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, platform)
);

-- Video tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS video_tags (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) REFERENCES videos(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, tag)
);

-- Publish status table
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

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_upload_date ON videos(upload_date);
CREATE INDEX IF NOT EXISTS idx_videos_scheduled_date ON videos(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_video_platforms_video_id ON video_platforms(video_id);
CREATE INDEX IF NOT EXISTS idx_video_tags_video_id ON video_tags(video_id);
CREATE INDEX IF NOT EXISTS idx_publish_status_video_id ON publish_status(video_id);
