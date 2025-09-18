CREATE TABLE sale (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sale_price NUMERIC(10, 2) NOT NULL,
    user_amount INT NOT NULL DEFAULT 0,
    sale_expiration TIMESTAMPTZ,
    user_subscription_time INT NOT NULL DEFAULT 30,
    status VARCHAR(255) NOT NULL
);