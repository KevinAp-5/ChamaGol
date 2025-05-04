CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY NOT NULL unique,
    name VARCHAR(255) not null,
    login VARCHAR(255) not null unique,
    password VARCHAR(255) not null
)