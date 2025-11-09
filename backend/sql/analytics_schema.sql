CREATE TABLE IF NOT EXISTS channel_analytics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    followers INTEGER DEFAULT 0,
    subscribers INTEGER DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    total_posts INTEGER DEFAULT 0,
    total_tweets INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    total_likes BIGINT DEFAULT 0,
    total_comments BIGINT DEFAULT 0,
    total_shares BIGINT DEFAULT 0,
    total_retweets BIGINT DEFAULT 0,
    total_replies BIGINT DEFAULT 0,
    total_upvotes BIGINT DEFAULT 0,
    engagement_rate DECIMAL(10, 2) DEFAULT 0.00,
    average_score DECIMAL(10, 2) DEFAULT 0.00,
    karma INTEGER DEFAULT 0,
    total_reach BIGINT DEFAULT 0,
    total_impressions BIGINT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_channel_analytics UNIQUE (project_id, platform, collected_at)
);

CREATE TABLE IF NOT EXISTS content_analytics (
    id SERIAL PRIMARY KEY,
    channel_analytics_id INTEGER REFERENCES channel_analytics(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50),
    title TEXT,
    views BIGINT DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    retweets INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_content_analytics UNIQUE (project_id, platform, content_id, collected_at)
);

CREATE INDEX IF NOT EXISTS idx_channel_analytics_project_platform 
    ON channel_analytics(project_id, platform);

CREATE INDEX IF NOT EXISTS idx_channel_analytics_collected_at 
    ON channel_analytics(collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_channel_analytics_project_time 
    ON channel_analytics(project_id, collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_analytics_channel 
    ON content_analytics(channel_analytics_id);

CREATE INDEX IF NOT EXISTS idx_content_analytics_project_platform 
    ON content_analytics(project_id, platform);

CREATE INDEX IF NOT EXISTS idx_content_analytics_collected_at 
    ON content_analytics(collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_analytics_content 
    ON content_analytics(content_id, platform);

CREATE OR REPLACE VIEW latest_channel_analytics AS
SELECT DISTINCT ON (project_id, platform)
    *
FROM channel_analytics
ORDER BY project_id, platform, collected_at DESC;

CREATE OR REPLACE VIEW channel_analytics_24h AS
SELECT 
    project_id,
    platform,
    collected_at,
    followers,
    total_views,
    total_likes,
    engagement_rate
FROM channel_analytics
WHERE collected_at >= NOW() - INTERVAL '24 hours'
ORDER BY project_id, platform, collected_at DESC;

CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
    DELETE FROM channel_analytics 
    WHERE collected_at < NOW() - INTERVAL '30 days';
    
    DELETE FROM content_analytics 
    WHERE collected_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE channel_analytics IS 'Speichert Channel-Level Analytics alle 5 Minuten für Live-Grafiken';
COMMENT ON TABLE content_analytics IS 'Speichert individuelle Content-Performance-Daten';
COMMENT ON VIEW latest_channel_analytics IS 'Zeigt die neuesten Analytics für jede Plattform pro Projekt';
COMMENT ON VIEW channel_analytics_24h IS 'Analytics der letzten 24 Stunden für Trend-Grafiken';
