ALTER TABLE usuario add role varchar(20);
update usuario set role = 'user';