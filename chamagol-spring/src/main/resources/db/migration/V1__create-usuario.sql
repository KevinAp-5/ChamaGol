CREATE table usuario (
    id BIGSERIAL not null primary key,
    nome varchar(120) not null,
    email varchar(120) not null,
    senha varchar(100) not null,
    status varchar(24) not null,
    assinatura varchar(100) not null,
    user_role varchar(20) not null
)