CREATE TABLE usuario_verificador (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL,
    data_expira TIMESTAMP NOT NULL,
    id_usuario BIGINT,
    CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);