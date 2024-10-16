CREATE table sinal (
    id BigInt not null auto_increment,
    campeonato varchar(100) not null,
    nomeTimes varchar(100) not null,
    placar varchar(100) not null,
    acaoSinal varchar(100) not null,

    primary key(id)
);