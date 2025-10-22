package com.usermanager.manager.controller;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePaymentMethodsRequest;
import com.mercadopago.client.preference.PreferencePaymentTypeRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.usermanager.manager.dto.common.ResponseMessage;
import com.usermanager.manager.enums.Subscription;
import com.usermanager.manager.infra.service.WebhookService;
import com.usermanager.manager.model.sale.Sale;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.webhook.WebhookEvent;
import com.usermanager.manager.model.webhook.enums.EventStatus;
import com.usermanager.manager.service.sale.SaleService;
import com.usermanager.manager.service.user.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Pagamentos", description = "Endpoints de pagamentos, webhooks e callbacks MercadoPago")
@RestController
@RequestMapping("/api/payment")
@Slf4j
public class PaymentController {
    @Value("${mercadopago.webhook.secret.token}")
    private String mercadoPagoSecret;

    private final WebhookService webhookService;
    private final UserService userService;
    private final SaleService saleService;
    private PreferenceClient preferenceClient;

    public PaymentController(WebhookService webhookService, UserService userService,
            PreferenceClient preferenceClient, SaleService saleService) {
        this.webhookService = webhookService;
        this.userService = userService;
        this.saleService = saleService;
        this.preferenceClient = preferenceClient;
    }

    @Operation(summary = "Consultar status da assinatura do usuário autenticado")
    @ApiResponse(responseCode = "200", description = "Status da assinatura retornado")
    @GetMapping("/status")
    public ResponseEntity<ResponseMessage> getUserSubscriptionStatus(@Parameter(description = "Usuário autenticado") @AuthenticationPrincipal User user) {
        var userResponse = userService.findById(user.getId());
        Subscription userSubscription = userResponse.getSubscription();

        if (userSubscription == Subscription.VIP) {
            return ResponseEntity.ok(new ResponseMessage("VIP"));
        }

        return ResponseEntity.ok(new ResponseMessage(userSubscription.getValue()));
    }

    @Operation(summary = "Receber Webhook do MercadoPago", description = "Endpoint para receber notificações de pagamento do MercadoPago.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Webhook recebido com sucesso"),
            @ApiResponse(responseCode = "400", description = "Requisição inválida"),
            @ApiResponse(responseCode = "401", description = "Assinatura inválida")
    })

    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(
        @Parameter(description = "Assinatura do MercadoPago") @RequestHeader(value = "x-signature", required = false) String xSignature,
        @Parameter(description = "ID da requisição") @RequestHeader(value = "x-request-id", required = false) String xRequestId,
        @Parameter(description = "Query params") @RequestParam Map<String, String> queryParams,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Payload do webhook", 
            required = true, 
            content = @Content(schema = @Schema(implementation = Map.class))) @RequestBody Map<String, Object> payload) 
        {

        log.info("Webhook recebido - RequestId: {}, Signature: {}", xRequestId, xSignature);
        log.info("Query params: {}", queryParams);
        log.info("Payload: {}", payload);
        log.debug("Secret configurado: {}", mercadoPagoSecret.substring(0, 3) + "..." +
                (mercadoPagoSecret.length() > 6 ? mercadoPagoSecret.substring(mercadoPagoSecret.length() - 3) : ""));

        try {
            // 1. Extrair o data.id dos query params conforme a documentação
            String dataId = queryParams.get("data.id");

            // Caso não esteja nos query params, tentar extrair do body como fallback
            if (dataId == null && payload.containsKey("data")) {
                Object dataObj = payload.get("data");
                if (dataObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) dataObj;
                    if (data.containsKey("id")) {
                        dataId = String.valueOf(data.get("id"));
                    } else {
                        log.error("data.id não encontrado na requisição. RequestId: {}", xRequestId);
                        return ResponseEntity.badRequest().body("data.id obrigatório");
                    }
                }
            }
            log.info("Processando webhook para dataId: {}", dataId);

            // 2. Validar a assinatura conforme documentação oficial (se a assinatura
            // estiver presente)

            if (xSignature == null || xSignature.trim().isEmpty()) {
                log.error("assinatura em branco, rejeitando. {}", xRequestId);
                return ResponseEntity.status(401).body("Assinatura em branco, rejeitando");
            }

            if (!webhookService.validateSignature(xSignature, xRequestId, dataId, mercadoPagoSecret)) {
                log.error("Assinatura inválida para request ID: {}", xRequestId);
                return ResponseEntity.status(401).body("Assinatura inválida");
            }

            // 3. Salvar o evento
            WebhookEvent webhookEvent = createWebhookEvent(payload);
            log.info("Evento de webhook salvo: {}", webhookEvent);

            // 4. Retornar 200 para evitar múltiplas tentativas de reenvio pelo Mercado Pago
            return ResponseEntity.ok("Notificação recebida com sucesso");

        } catch (Exception e) {
            log.error("Erro ao processar webhook", e);
            return ResponseEntity.status(500).body("Erro no processamento");
        }
    }

    private ResponseEntity<String> createClientPaymentPreference(PreferenceClient client, PreferenceRequest request) {
        try {
            Preference preference = client.create(request);
            log.info("Payment preference created successfully. ID: {}", preference.getId());
            return ResponseEntity.ok(preference.getInitPoint());
        } catch (MPApiException apiEx) {
            log.error("MercadoPago API error: {}", apiEx.getApiResponse().getContent(), apiEx);
            return ResponseEntity.status(500).body("Erro no gateway de pagamento");
        } catch (MPException ex) {
            log.error("MercadoPago general error", ex);
            return ResponseEntity.status(500).body("Erro no processamento do pagamento");
        }
    }

    @Operation(summary = "Criar pagamento MercadoPago", description = "Cria uma preferência de pagamento MercadoPago para o usuário autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "ID da preferência de pagamento retornado"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado")
    })
    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@Parameter(description = "Usuário autenticado") @AuthenticationPrincipal User user) throws MPException {
        if (user == null) {
            return ResponseEntity.status(401).body("unauthorized");
        }

        log.info("Initiating payment creation");
        PreferenceClient client = this.preferenceClient;

        List<PreferenceItemRequest> items = createPaymentItem(user);

        List<PreferencePaymentTypeRequest> excludedPaymentTypes = createExcludedPaymentItems();
        PreferencePaymentMethodsRequest paymentMethods = createPaymentMethods(excludedPaymentTypes);

        PreferenceRequest request = createPreferenceRequest(items, paymentMethods, user);

        return createClientPaymentPreference(client, request);
    }

    @Operation(summary = "Callback de sucesso do pagamento", description = "Callback HTML para sucesso do pagamento MercadoPago.")
    @ApiResponse(responseCode = "200", description = "Página de sucesso")
    @GetMapping("/success")
    public String success(Model model) {
        log.info("Payment success callback received");
        model.addAttribute("status", "success");
        model.addAttribute("title", "Pagamento Aprovado");
        model.addAttribute("message", "Seu pagamento foi processado com sucesso. Obrigado pela compra!");
        model.addAttribute("cssClass", "success");
        return "payment-result";
    }

    @Operation(summary = "Callback de falha do pagamento", description = "Callback HTML para falha do pagamento MercadoPago.")
    @ApiResponse(responseCode = "200", description = "Página de falha")
    @GetMapping("/failure")
    public String failure(Model model) {
        log.info("Payment failure callback received");
        model.addAttribute("status", "failure");
        model.addAttribute("title", "Pagamento Recusado");
        model.addAttribute("message", "Houve um problema ao processar seu pagamento. Por favor, tente novamente.");
        model.addAttribute("cssClass", "failure");
        return "payment-result";
    }

    @Operation(summary = "Callback de pagamento pendente", description = "Callback HTML para pagamento pendente MercadoPago.")
    @ApiResponse(responseCode = "200", description = "Página de pendência")
    @GetMapping("/pending")
    public String pending(Model model) {
        log.info("Payment pending callback received");
        model.addAttribute("status", "pending");
        model.addAttribute("title", "Pagamento Pendente");
        model.addAttribute("message", "Seu pagamento está pendente. Assim que for confirmado, você será notificado.");
        model.addAttribute("cssClass", "pending");
        return "payment-result";
    }

    @Transactional
    private WebhookEvent createWebhookEvent(Object payload) {
        ObjectMapper mapper = new ObjectMapper();
        String payloadJson = "";
        try {
            payloadJson = mapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.warn("Erro ao converter payload para JSON", e);
        }

        WebhookEvent event = WebhookEvent.builder()
                .payloadJson(payloadJson)
                .status(EventStatus.PENDING)
                .receivedAt(ZonedDateTime.now())
                .retryCount(0)
                .build();

        return webhookService.saveWebhookEvent(event);
    }


    private List<PreferenceItemRequest> createPaymentItem(User user) {
        Sale sale = saleService.getActiveSale().orElse(null);
        log.info("sale: {}", sale);
        BigDecimal unitPrice = (sale != null) ? sale.getSalePrice() : new BigDecimal("29.00");
        log.info("SALE PRICE: {}", unitPrice);
        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(PreferenceItemRequest.builder()
                .id("subscriptionVIP-" + user.getId())
                .pictureUrl("https://freeimage.host/i/34hk2ku")
                .title("ChamaGol")
                .description("ChamaGol VIP")
                .quantity(1)
                .unitPrice(unitPrice)
                .currencyId("BRL")
                .build());
        log.debug("Payment items configured: {}", items);
        return items;
    }

    private List<PreferencePaymentTypeRequest> createExcludedPaymentItems() {
        List<PreferencePaymentTypeRequest> excludedPaymentTypes = new ArrayList<>();
        excludedPaymentTypes.add(PreferencePaymentTypeRequest.builder().id("atm").build());
        return excludedPaymentTypes;
    }

    private PreferencePaymentMethodsRequest createPaymentMethods(List<PreferencePaymentTypeRequest> excludedPayments) {
        var paymentMethods = PreferencePaymentMethodsRequest.builder()
                .excludedPaymentTypes(excludedPayments)
                .installments(1)
                .build();
        log.debug("Payment methods configured: {}", paymentMethods);
        return paymentMethods;
    }

    private PreferenceRequest createPreferenceRequest(List<PreferenceItemRequest> items,
            PreferencePaymentMethodsRequest paymentMethods, User user) {
        PreferenceRequest request = PreferenceRequest.builder()
                .items(items)
                .paymentMethods(paymentMethods)
                .statementDescriptor("Chamagol")
                // .payer(PreferencePayerRequest.builder()
                // .email(user.getLogin())
                // .name(user.getName())
                // .build())
                .externalReference(String.valueOf(user.getId()))
                .backUrls(PreferenceBackUrlsRequest.builder()
                        .success("chamagol://payment/success")
                        .failure("chamagol://payment/failure")
                        .pending("chamagol://payment/pending")
                        .build())
                .notificationUrl("https://chamagol.com/api/payment/webhook")
                .autoReturn("approved")
                .build();
        log.debug("Preference request configured: {}", request);
        return request;
    }
}
