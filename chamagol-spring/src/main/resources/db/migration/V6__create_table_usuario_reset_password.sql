CREATE TABLE usuario_reset_password (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL,
    data_expira TIMESTAMP WITH TIME ZONE NOT NULL,
    id_usuario BIGINT UNIQUE,
    CONSTRAINT fk_usuario_reset_password_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuario (id)
        ON DELETE CASCADE
);