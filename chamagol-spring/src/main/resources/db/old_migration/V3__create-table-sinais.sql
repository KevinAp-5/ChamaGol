CREATE table sinal (
    id BIGSERIAL not null primary key,
    campeonato varchar(100) not null,
    nomeTimes varchar(100) not null,
    placar varchar(100) not null,
    acaoSinal varchar(100) not null,

);