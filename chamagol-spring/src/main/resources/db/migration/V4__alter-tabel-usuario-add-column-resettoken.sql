alter table usuario add resettoken varchar(200);
update usuario set resettoken = "null";