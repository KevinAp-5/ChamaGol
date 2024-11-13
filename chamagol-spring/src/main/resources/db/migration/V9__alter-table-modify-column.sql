ALTER TABLE sinal 
    CHANGE id id BIGINT NOT NULL AUTO_INCREMENT,
    CHANGE campeonato campeonato VARCHAR(255) NOT NULL,
    CHANGE nomeTimes nome_times VARCHAR(255) NOT NULL,
    CHANGE placar placar VARCHAR(255) NOT NULL,
    CHANGE acaoSinal acao_sinal VARCHAR(255) NOT NULL;
