CREATE TABLE user_term_acceptance (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    term_of_use_id BIGINT NOT NULL,
    is_adult BOOLEAN NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_user_termacceptance_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_termacceptance_termofuse
        FOREIGN KEY (term_of_use_id)
        REFERENCES term_of_use(id)
        ON DELETE CASCADE
);
