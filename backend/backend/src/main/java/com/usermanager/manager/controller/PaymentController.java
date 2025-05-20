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
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferencePaymentMethodsRequest;
import com.mercadopago.client.preference.PreferencePaymentTypeRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.usermanager.manager.infra.service.WebhookService;
import com.usermanager.manager.model.webhook.WebhookEvent;
import com.usermanager.manager.model.webhook.enums.EventStatus;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payment")
@Slf4j
public class PaymentController {
    @Value("${mercadopago.webhook.secret.token}")
    private String mercadoPagoSecret;

    private final WebhookService webhookService;
    private PreferenceClient preferenceClient;

    public PaymentController(WebhookService webhookService, PreferenceClient preferenceClient) {
        this.webhookService = webhookService;
        this.preferenceClient = preferenceClient;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId,
            @RequestParam Map<String, String> queryParams,
            @RequestBody Map<String, Object> payload) {

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

    /**
     * Cria e salva um evento de webhook a partir do payload recebido
     */
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

    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@AuthenticationPrincipal com.usermanager.manager.model.user.User user)
            throws MPException {
        if (user == null) {
            return ResponseEntity.status(401).body("unauthorized");
        }

        log.info("Initiating payment creation");
        PreferenceClient client = this.preferenceClient;

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(PreferenceItemRequest.builder()
                .id("subscriptionPro-" + user.getId())
                .pictureUrl("https://freeimage.host/i/34hk2ku")
                .title("PRO - ChamaGol")
                .description("Assinatura PRO chamagol - período mensal")
                .quantity(1)
                .unitPrice(new BigDecimal("00.01"))
                .currencyId("BRL")
                .build());
        log.debug("Payment items configured: {}", items);

        List<PreferencePaymentTypeRequest> excludedPaymentTypes = new ArrayList<>();
        excludedPaymentTypes.add(PreferencePaymentTypeRequest.builder().id("ticket").build());
        excludedPaymentTypes.add(PreferencePaymentTypeRequest.builder().id("atm").build());

        PreferencePaymentMethodsRequest paymentMethods = PreferencePaymentMethodsRequest.builder()
                .excludedPaymentTypes(excludedPaymentTypes)
                .installments(1)
                .build();
        log.debug("Payment methods configured: {}", paymentMethods);

        PreferenceRequest request = PreferenceRequest.builder()
                .items(items)
                .paymentMethods(paymentMethods)
                .payer(PreferencePayerRequest.builder()
                        .email(user.getLogin())
                        .name(user.getName())
                        .build())
                .externalReference(String.valueOf(user.getId()))
                .backUrls(PreferenceBackUrlsRequest.builder()
                        .success("chamagol://payment/success")
                        .failure("chamagol://payment/failure")
                        .pending("chamagol://payment/pending")
                        .build())
                .notificationUrl("https://chamagol-9gfb.onrender.com/api/payment/webhook")
                .autoReturn("approved")
                .build();
        log.debug("Preference request configured: {}", request);

        try {
            Preference preference = client.create(request);
            log.info("Payment preference created successfully. ID: {}", preference.getId());
            return ResponseEntity.ok(preference.getId());
        } catch (MPApiException apiEx) {
            log.error("MercadoPago API error: {}", apiEx.getApiResponse().getContent(), apiEx);
            return ResponseEntity.status(500).body("Erro no gateway de pagamento");
        } catch (MPException ex) {
            log.error("MercadoPago general error", ex);
            return ResponseEntity.status(500).body("Erro no processamento do pagamento");
        }
    }

    @GetMapping("/success")
    public String success(Model model) {
        log.info("Payment success callback received");
        model.addAttribute("status", "success");
        model.addAttribute("title", "Pagamento Aprovado");
        model.addAttribute("message", "Seu pagamento foi processado com sucesso. Obrigado pela compra!");
        model.addAttribute("cssClass", "success");
        return "payment-result";
    }

    @GetMapping("/failure")
    public String failure(Model model) {
        log.info("Payment failure callback received");
        model.addAttribute("status", "failure");
        model.addAttribute("title", "Pagamento Recusado");
        model.addAttribute("message", "Houve um problema ao processar seu pagamento. Por favor, tente novamente.");
        model.addAttribute("cssClass", "failure");
        return "payment-result";
    }

    @GetMapping("/pending")
    public String pending(Model model) {
        log.info("Payment pending callback received");
        model.addAttribute("status", "pending");
        model.addAttribute("title", "Pagamento Pendente");
        model.addAttribute("message", "Seu pagamento está pendente. Assim que for confirmado, você será notificado.");
        model.addAttribute("cssClass", "pending");
        return "payment-result";
    }
}
