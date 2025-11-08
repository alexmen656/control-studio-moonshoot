ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS region_id VARCHAR(50) DEFAULT 'austria-east-1';

CREATE INDEX IF NOT EXISTS idx_projects_region_id ON projects(region_id);

UPDATE projects 
SET region_id = 'austria-east-1' 
WHERE region_id IS NULL;
