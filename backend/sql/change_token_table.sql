DROP INDEX IF EXISTS idx_user_service;

CREATE UNIQUE INDEX idx_project_service ON user_api_tokens(project_id, service_name);
