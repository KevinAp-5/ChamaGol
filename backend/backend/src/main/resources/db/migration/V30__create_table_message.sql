CREATE TABLE message (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    people VARCHAR(255) NOT NULL
);