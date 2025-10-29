CREATE TABLE oauth_states (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    project_id INTEGER NOT NULL,
    state_token VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '15 minutes'
);

CREATE INDEX idx_oauth_states_expires_at ON oauth_states (expires_at);
