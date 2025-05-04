CREATE TABLE signals (
    id BIGSERIAL PRIMARY KEY,
    campeonato VARCHAR(255) NOT NULL,
    nome_times VARCHAR(255) NOT NULL,
    tempo_partida VARCHAR(255) NOT NULL,
    placar VARCHAR(255) NOT NULL,
    acao_sinal VARCHAr(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(255) NOT NULL
);