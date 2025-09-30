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

		// TODO: adicionar um controller para gerenciar os preços do produto + adicionar
		// uma regra de assinatura trimensal,etc...

		// TODO: adicionar um email quando o usuário ativar a assinatura VIP

		// TODO: imeplemntar autologin na tela( fazer uso do refreshTOken)

		// TODO: implementar OAUTH do google

		// TODO: adicionar html ao email que é enviado quando o pagamento é aprovado.

		// --------------------------
		// Sale implementatios tasks
		// TODO: modificar controller de payments, para realizar o fetch da sale ativar,
		// e implementar no sistema para pegar o preço e nome da oferta.
		// TODO: Ao efetivar o usuário para vip com a sale com o subscriptionTime
		// determinado(30, 60, 90 dias).

		// TODO: implementar o SaleService na webhookService, para quando for processado o pagamento
		// para modificar o sale.

		// TODO: criar a classe de testes da SaleService

		// --------------------------
		// Sale feature todos
		// TODO: adicionar controle de usuários que já usaram a sale.
		// TODO: criar campo userIlimited (boolean) na entidade Sale para saber se é
		// limitada por tempo ou usuários.
		// TODO: métodos da SaleService: scheduler para remover sale
		// na data de expiração, usar sale (diminuir quantidade de usuários
		// disponíveis).
		// TODO: modificar PaymentController para buscar sale ativa e usar preço/nome da
		// oferta.
		// TODO: ao efetivar usuário VIP, usar subscriptionTime da sale (30, 60, 90
		// dias).
		// TODO: adicionar campo data de criação da oferta na entidade Sale.
		// TODO: adicionar campo data de encerramento real na entidade Sale.
		// TODO: adicionar lista de usuários que usaram a oferta na entidade Sale.
				// TODO: criar uma tabela que vai armazenar os usuários que utilizaram
		// TODO: adicionar endpoint para consultar oferta ativa.
		// TODO: adicionar endpoint para consultar histórico de ofertas.
		// TODO: adicionar validação no backend para impedir criação de nova oferta ativa.

		// --------------------------
		// Painel ADM frontend todos
		// TODO: criar página para mestre criar sale.
		// TODO: criar validação JS para não permitir sale ilimitada de usuários sem
		// limitação de data.
		// TODO: frontend deve fazer fetch para verificar se já existe sale ativa.
		// TODO: criar tela para acessar sales anteriores e desativá-las.

		// --------------------------
		// Mobile frontend todos
		// TODO: na página de vendas, fazer fetch para verificar sale ativa.
		// TODO: se houver sale ativa, atualizar preço, nome da oferta e tempo de
		// assinatura dinamicamente.
		// TODO: mostrar nome da oferta, tempo de duração da assinatura.
		// TODO: indicar que assinatura via PIX não é renovada automaticamente.
		// TODO: mostrar ícones MercadoPago, Pix, Mastercard, Boleto, etc.
		// TODO: pagamentos seguros via MercadoPago.

		// TODO: adicionar um regex no campo de nome e max lenght
		// TODO: adicionar um max lenght no campo de email.

 		// TODO: possiveis métodos da service de sale
		// 
		// criar sale
		// deletar sale - soft delete usando o Enum de status inactive
		// listar todo o histórico de sales
		// scheduler para remover a sale na data que ela encerrar
		// usar sale -> toda vez que uma sale for usada, vai diminuir a quantidade de usuários disponiveis a usar: -1, -1.
		// sale ativa -> metodo que vai retornar as informações da sale ativa no sistema, retornar null se não tiver nenhuma.
// 
	}

}
