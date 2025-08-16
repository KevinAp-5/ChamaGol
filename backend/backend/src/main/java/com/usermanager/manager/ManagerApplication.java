package com.usermanager.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ManagerApplication.class, args);
		// TODO: adicionar envio de notificações mesmo com app fechado


		// TODO: inserir um default term of uso assim que a aplicação rodar, caso estiver ausente no banco de dados

		// TODO: adicionar um controller para gerenciar os preços do produto + adicionar uma regra de assinatura trimensal,etc...

		// TODO: adicionar um email quando o usuário ativar a assinatura VIP
	}

}
