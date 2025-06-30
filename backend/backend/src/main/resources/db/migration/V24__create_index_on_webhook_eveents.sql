CREATE INDEX idx_webhook_events_status ON webhook_events (event_status);
CREATE INDEX idx_webhook_events_processed_at ON webhook_events (processed_at);
CREATE INDEX idx_webhook_events_received_at ON webhook_events (received_at);
CREATE INDEX idx_webhook_events_retry_count ON webhook_events (retry_count);