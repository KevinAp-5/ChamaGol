ALTER TABLE refresh_token
ADD CONSTRAINT constraint_token_unique UNIQUE (token);