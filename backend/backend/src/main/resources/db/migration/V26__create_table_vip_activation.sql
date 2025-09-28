CREATE TABLE vip_activation (

    id BIGSERIAL PRIMARY KEY NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    sale_id BIGINT,
    creation_date TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_vip_activation_user
        FOREIGN KEY(user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vip_activation_sale_id
        FOREIGN KEY (sale_id)
        REFERENCES sale (id)
        ON DELETE CASCADE

);