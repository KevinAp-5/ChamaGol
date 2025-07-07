package com.usermanager.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ManagerApplication.class, args);
		// TODO: adicionar envio de notificações mesmo com app fechado
		// TODO: criar um Scheduler para ir limpando as entidades antigas

		// TODO: mudar aplicação para portugues, incluindo mensagens de erros, e os email

		// TODO: arrumar Error interno no servidor: could not execute statement [ERROR: duplicate key value violates unique constraint \"users_login_key\"\n  Detail: Key (login)=(keven.clash3@gmail.com) already exists.] [insert into users (created_at,is_enabled,last_login,login,name,password,role,status,subscription,updated_at) values (?,?,?,?,?,?,?,?,?,?)]; SQL [insert into users (created_at,is_enabled,last_login,login,name,password,role,status,subscription,updated_at) values (?,?,?,?,?,?,?,?,?,?)]; constraint [users_login_key]


		// TODO: inserir um default term of uso assim que a aplicação rodar, caso estiver ausente no banco de dados

		// TODO: adicionar um controller para gerenciar os preços do produto + adicionar uma regra de assinatura trimensal,etc...
	}

}
