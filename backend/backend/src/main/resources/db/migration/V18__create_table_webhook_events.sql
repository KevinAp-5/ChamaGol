CREATE TABLE webhook_events (
    id BIGINT PRIMARY KEY,
    payload_json VARCHAR(255) NOT NULL,
    event_status VARCHAR(255) NOT NULL,
    received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    retry_count INT
);