ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS advanced_options JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_videos_advanced_options ON videos USING GIN (advanced_options);

COMMENT ON COLUMN videos.advanced_options IS 'Platform-specific advanced options (Instagram location_id, TikTok privacy settings, etc.)';