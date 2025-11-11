package com.usermanager.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ManagerApplication.class, args);
		// TODO: adicionar envio de notificações mesmo com app fechado

		// TODO: inserir um default term of uso assim que a aplicação rodar, caso
		// estiver ausente no banco de dados

		// TODO: imeplemntar autologin na tela( fazer uso do refreshTOken)

		// TODO: implementar OAUTH do google

		// --------------------------
		// Sale implementatios tasks

		// --------------------------
		// Sale feature todos
		// TODO: adicionar controle de usuários que já usaram a sale.
		// TODO: métodos da SaleService: scheduler para remover sale
		// na data de expiração, usar sale (diminuir quantidade de usuários
		// disponíveis).

		// --------------------------
		// Painel ADM frontend todos
		// TODO: criar validação JS para não permitir sale ilimitada de usuários sem
		// limitação de data.
		// TODO: frontend deve fazer fetch para verificar se já existe sale ativa.
		// TODO: criar tela para acessar sales anteriores e desativá-las.

		// --------------------------

	}

}
