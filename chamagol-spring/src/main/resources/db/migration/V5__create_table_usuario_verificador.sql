CREATE TABLE usuario_verificador (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL,
    data_expira TIMESTAMP WITH TIME ZONE NOT NULL,
    id_usuario BIGINT UNIQUE,
    CONSTRAINT fk_usuario_verificador_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuario (id)
        ON DELETE CASCADE
);