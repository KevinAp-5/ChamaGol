CREATE TABLE sale (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sale_price NUMERIC(10, 2) NOT NULL,
    user_amount INT NOT NULL DEFAULT 0,
    used_amount INT NOT NULL,
    sale_expiration TIMESTAMPTZ,
    creation_date TIMESTAMPTZ NOT NULL,
    finished_date TIMESTAMPTZ,
    user_subscription_time INT NOT NULL DEFAULT 30,
    status VARCHAR(255) NOT NULL
);