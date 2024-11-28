CREATE table usuario (
    id BIGSERIAL not null primary key,
    nome varchar(100) not null,
    email varchar(120) not null,
    senha varchar(100) not null,
    assinatura varchar(100) not null
);