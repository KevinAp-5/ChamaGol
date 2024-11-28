ALTER TABLE usuario ADD COLUMN IF NOT EXISTS status VARCHAR(24);

-- Só atualiza se status for nulo
UPDATE usuario SET status = 'ACTIVE' WHERE status IS NULL;