CREATE TABLE controle_email (
    id BIGSERIAL NOT NULL PRIMARY KEY,                -- Chave primária com auto-incremento
    quantidade_emails BIGINT DEFAULT 0,              -- Contador de e-mails enviados
    ultimo_email TIMESTAMP WITH TIME ZONE DEFAULT NULL,  -- Data/hora com fuso horário
    id_usuario BIGINT UNIQUE,                        -- Relacionado ao usuário (único)
    CONSTRAINT fk_controle_email 
        FOREIGN KEY (id_usuario) REFERENCES usuario (id) ON DELETE CASCADE -- Chave estrangeira
);
CREATE INDEX inx_ultimo_email on controle_email (ultimo_email);