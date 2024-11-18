CREATE TABLE usuarioResetPassword (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID NOT NULL,
    data_expira TIMESTAMP NOT NULL,
    id_usuario BIGINT UNIQUE,
    CONSTRAINT fk_usuario 
        FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);