package com.usermanager.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ManagerApplication.class, args);
		// TODO: adicionar envio de notificações mesmo com app fechado
		// TODO: criar um Scheduler para ir limpando as entidades antigas
		// TODO: arrumar o STATUS inative mesmo quando o usuário confirma o email.

		// TODO: mudar aplicação para portugues, incluindo mensagens de erros, e os email
	}

}
