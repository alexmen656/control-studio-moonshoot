DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_api_tokens' AND column_name='project_id'
    ) THEN
        ALTER TABLE user_api_tokens ADD COLUMN project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;
        
        CREATE INDEX idx_user_api_tokens_project_id ON user_api_tokens(project_id);
    END IF;
END $$;

UPDATE user_api_tokens
SET project_id = (SELECT id FROM projects WHERE name = 'Testproject' LIMIT 1)
WHERE project_id IS NULL;

ALTER TABLE user_api_tokens
ADD CONSTRAINT user_api_tokens_unique
UNIQUE (user_id, service_name, project_id);
