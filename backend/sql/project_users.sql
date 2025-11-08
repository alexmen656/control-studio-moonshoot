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
