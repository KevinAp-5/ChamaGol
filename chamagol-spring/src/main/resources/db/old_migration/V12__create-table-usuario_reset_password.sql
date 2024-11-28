ALTER TABLE usuarios.usuario_reset_password DROP CONSTRAINT IF EXISTS fk_usuario;

CREATE TABLE usuario_reset_password (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID NOT NULL,
    data_expira TIMESTAMP NOT NULL,
    id_usuario BIGINT,
    CONSTRAINT fk_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id) 
        ON DELETE CASCADE
);