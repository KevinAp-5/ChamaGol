CREATE table usuario (
    id BigInt not null auto_increment,
    nome varchar(100) not null,
    email varchar(120) not null,
    senha varchar(100) not null,
    assinatura varchar(100) not null,

    primary key(id)
);