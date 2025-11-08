DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='videos' AND column_name='project_id'
    ) THEN
        ALTER TABLE videos ADD COLUMN project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;
        
        CREATE INDEX idx_videos_project_id ON videos(project_id);
    END IF;
END $$;
