ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

UPDATE users SET role = 'user' WHERE role IS NULL;