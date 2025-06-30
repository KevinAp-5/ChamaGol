CREATE UNIQUE INDEX idx_users_login ON users (login);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_subscription ON users (subscription);
CREATE INDEX idx_users_last_login ON users (last_login);