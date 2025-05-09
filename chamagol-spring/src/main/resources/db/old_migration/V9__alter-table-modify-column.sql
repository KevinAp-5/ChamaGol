-- Renomear colunas
ALTER TABLE sinal RENAME COLUMN nomeTimes TO nome_times;
ALTER TABLE sinal RENAME COLUMN acaoSinal TO acao_sinal;

-- Alterar tipos e restrições
ALTER TABLE sinal ALTER COLUMN id TYPE BIGINT;
ALTER TABLE sinal ALTER COLUMN id SET NOT NULL;
ALTER TABLE sinal ALTER COLUMN campeonato TYPE VARCHAR(255) USING campeonato::VARCHAR;
ALTER TABLE sinal ALTER COLUMN campeonato SET NOT NULL;
ALTER TABLE sinal ALTER COLUMN nome_times TYPE VARCHAR(255) USING nome_times::VARCHAR;
ALTER TABLE sinal ALTER COLUMN nome_times SET NOT NULL;
ALTER TABLE sinal ALTER COLUMN placar TYPE VARCHAR(255) USING placar::VARCHAR;
ALTER TABLE sinal ALTER COLUMN placar SET NOT NULL;
ALTER TABLE sinal ALTER COLUMN acao_sinal TYPE VARCHAR(255) USING acao_sinal::VARCHAR;
ALTER TABLE sinal ALTER COLUMN acao_sinal SET NOT NULL;

CREATE SEQUENCE sinal_id_seq;
ALTER TABLE sinal ALTER COLUMN id SET DEFAULT nextval('sinal_id_seq');