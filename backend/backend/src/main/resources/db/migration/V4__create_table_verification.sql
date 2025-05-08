CREATE TABLE IF NOT EXISTS verification_token (
    uuid UUID PRIMARY KEY NOT NULL UNIQUE,
    user_id BIGINT,
    creation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    activation_date TIMESTAMP WITH TIME ZONE,
    activated BOOLEAN DEFAULT 'false' NOT NULL,
    token_type VARCHAR(255) NOT NULL,

    CONSTRAINT user_id
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);