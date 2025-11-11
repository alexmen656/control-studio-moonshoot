CREATE TABLE IF NOT EXISTS video_comments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    total_videos INTEGER DEFAULT 0,
    total_comments BIGINT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_video_comments UNIQUE (project_id, platform, collected_at)
);

CREATE TABLE IF NOT EXISTS video_comment_details (
    id SERIAL PRIMARY KEY,
    comment_collection_id INTEGER REFERENCES video_comments(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    video_id VARCHAR(255) NOT NULL,
    platform_id VARCHAR(255),
    video_title TEXT,
    total_comments INTEGER DEFAULT 0,
    comment_data JSONB DEFAULT '[]',
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_video_comment_details UNIQUE (project_id, platform, video_id, collected_at)
);

CREATE INDEX IF NOT EXISTS idx_video_comments_project_platform 
    ON video_comments(project_id, platform);

CREATE INDEX IF NOT EXISTS idx_video_comments_collected_at 
    ON video_comments(collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_comment_details_collection_id 
    ON video_comment_details(comment_collection_id);

CREATE INDEX IF NOT EXISTS idx_video_comment_details_project_platform 
    ON video_comment_details(project_id, platform);

CREATE INDEX IF NOT EXISTS idx_video_comment_details_video_id 
    ON video_comment_details(video_id);

CREATE INDEX IF NOT EXISTS idx_video_comment_details_platform_id 
    ON video_comment_details(platform_id);

CREATE INDEX IF NOT EXISTS idx_video_comment_details_collected_at 
    ON video_comment_details(collected_at DESC);