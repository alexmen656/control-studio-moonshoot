CREATE TABLE user_api_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    service_name VARCHAR(50) NOT NULL,
    token_content TEXT NOT NULL,
    token_iv CHAR(32) NOT NULL,
    token_tag CHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_service ON user_api_tokens(user_id, service_name);
