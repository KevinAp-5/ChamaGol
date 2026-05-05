CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    push_token VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(50),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true
);
