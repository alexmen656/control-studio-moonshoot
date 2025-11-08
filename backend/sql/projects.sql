CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    color1 VARCHAR(7) NOT NULL,
    color2 VARCHAR(7) NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

INSERT INTO projects (name, initials, color1, color2, user_id)
SELECT 'Testproject', 'TP', '#ef4444', '#ec4899', id
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE user_id = users.id
);