package com.usermanager.manager.infra.service;

import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercadopago.client.merchantorder.MerchantOrderClient;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.merchantorder.MerchantOrder;
import com.mercadopago.resources.payment.Payment;
import com.usermanager.manager.exception.webhook.WebhookProcessingException;
import com.usermanager.manager.infra.mail.MailService;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.webhook.WebhookEvent;
import com.usermanager.manager.model.webhook.enums.EventStatus;
import com.usermanager.manager.repository.WebhookEventsRepository;
import com.usermanager.manager.service.user.UserService;
import com.usermanager.manager.service.vip_activation.VipActivationService;

import lombok.extern.slf4j.Slf4j;

@Service
@EnableScheduling
@Slf4j
public class WebhookService {
    private static final int MAX_RETRY_COUNT = 5;
    private static final String STATUS_APPROVED = "approved";

    private final WebhookEventsRepository webhookRepository;
    private final UserService userService;
    private final PaymentClient paymentClient;
    private final MerchantOrderClient merchantOrderClient;
    private final ObjectMapper objectMapper;
    private final VipActivationService vipActivationService;
    private final MailService mailService;

    @Value("${mercadopago.webhook.secret:}")
    private String webhookSecret;

    public WebhookService(WebhookEventsRepository webhookRepository, UserService userService, VipActivationService vipActivationService, MailService mailService) {
        this.webhookRepository = webhookRepository;
        this.userService = userService;
        this.paymentClient = new PaymentClient();
        this.merchantOrderClient = new MerchantOrderClient();
        this.objectMapper = new ObjectMapper();
        this.vipActivationService = vipActivationService;
        this.mailService = mailService;
    }

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void processWebhookEvents() {
        List<WebhookEvent> pendingEvents = webhookRepository.findByStatusAndRetryCountLessThan(
                EventStatus.PENDING, MAX_RETRY_COUNT);

        log.info("Found {} pending webhook events to process", pendingEvents.size());

        if (pendingEvents.size() == 0) {
            return;
        }

        for (WebhookEvent event : pendingEvents) {
            try {
                processEvent(event);
                event.setStatus(EventStatus.PROCESSED);
                event.setProcessedAt(ZonedDateTime.now());
            } catch (WebhookProcessingException e) {
                log.error("Error processing webhook event id {}: {}", event.getId(), e.getMessage());
                handleProcessingError(event);
                continue;
            } catch (Exception e) {
                log.error("Unexpected error processing webhook event id {}: {}",
                        event.getId(), e.getMessage(), e);
                handleProcessingError(event);
                continue;
            }
            webhookRepository.save(event);
        }
    }

    private void processEvent(WebhookEvent event) throws WebhookProcessingException {
        Map<String, Object> payload = parsePayload(event);
        Map<String, Object> data = extractData(payload, event);
        Long paymentId = extractPaymentId(data);

        Payment payment = getPaymentDetails(paymentId);
        Long merchantOrderId = extractMerchantOrderId(payment);
        MerchantOrder merchantOrder = getMerchantOrder(merchantOrderId);

        Long userId = extractUserId(merchantOrder);
        User user = findUser(userId);

        updateUserSubscription(user, payment.getStatus());
        if (STATUS_APPROVED.equalsIgnoreCase(payment.getStatus()))
            mailService.sendMail(user.getLogin(), "Assinatura aprovada", "você se tornou usuário VIP!");
    }

    private Map<String, Object> parsePayload(WebhookEvent event) throws WebhookProcessingException {
        try {
            return objectMapper.readValue(event.getPayloadJson(),
                    new TypeReference<Map<String, Object>>() {
                    });
        } catch (JsonProcessingException e) {
            throw new WebhookProcessingException("Failed to parse payload JSON", e);
        }
    }

    private Map<String, Object> extractData(Map<String, Object> payload, WebhookEvent event)
            throws WebhookProcessingException {
        if (payload == null || !payload.containsKey("data") || payload.get("data") == null) {
            throw new WebhookProcessingException("Webhook event with null or missing data");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        return data;
    }

    private Long extractPaymentId(Map<String, Object> data) throws WebhookProcessingException {
        if (!data.containsKey("id") || data.get("id") == null) {
            throw new WebhookProcessingException("Webhook event data missing 'id'");
        }

        String paymentIdStr = String.valueOf(data.get("id"));
        try {
            return Long.valueOf(paymentIdStr);
        } catch (NumberFormatException e) {
            throw new WebhookProcessingException("Invalid payment ID format: " + paymentIdStr, e);
        }
    }

    private Payment getPaymentDetails(Long paymentId) throws WebhookProcessingException {
        log.info("Fetching payment ID: {}", paymentId);
        try {
            Payment payment = paymentClient.get(paymentId);
            if (payment == null) {
                throw new WebhookProcessingException("Payment not found for ID: " + paymentId);
            }
            log.info("Payment {} status: {}", paymentId, payment.getStatus());
            return payment;
        } catch (MPException e) {
            throw new WebhookProcessingException("Error fetching payment details for ID: " + paymentId, e);
        } catch (MPApiException e) {
            throw new WebhookProcessingException("ML API exception: " + e.getMessage());
        }
    }

    private Long extractMerchantOrderId(Payment payment) throws WebhookProcessingException {
        if (payment.getOrder() == null || payment.getOrder().getId() == null) {
            throw new WebhookProcessingException("Payment order or order ID is null");
        }

        return payment.getOrder().getId();
    }

    private MerchantOrder getMerchantOrder(Long merchantOrderId) throws WebhookProcessingException {
        try {
            MerchantOrder merchantOrder = merchantOrderClient.get(merchantOrderId);

            if (merchantOrder == null || merchantOrder.getExternalReference() == null) {
                throw new WebhookProcessingException(
                        "Merchant order or external_reference is null for merchantOrderId=" + merchantOrderId);
            }

            return merchantOrder;
        } catch (MPException e) {
            throw new WebhookProcessingException(
                    "Error fetching merchant order details for ID: " + merchantOrderId, e);
        } catch (MPApiException e) {
            throw new WebhookProcessingException("ML API exception: " + e.getMessage());
        }
    }

    private Long extractUserId(MerchantOrder merchantOrder) throws WebhookProcessingException {
        try {
            return Long.valueOf(merchantOrder.getExternalReference());
        } catch (NumberFormatException e) {
            throw new WebhookProcessingException(
                    "Invalid user ID format in external_reference: " + merchantOrder.getExternalReference(), e);
        }
    }

    private User findUser(Long userId) throws WebhookProcessingException {
        try {
            Optional<User> userOptional = userService.findByIdOptional(userId);
            return userOptional.orElseThrow(() -> new WebhookProcessingException("User not found with ID: " + userId));
        } catch (Exception e) {
            if (e instanceof WebhookProcessingException) {
                throw (WebhookProcessingException) e;
            }
            throw new WebhookProcessingException("Error finding user with ID: " + userId, e);
        }
    }

    private void updateUserSubscription(User user, String paymentStatus) {
        if (STATUS_APPROVED.equalsIgnoreCase(paymentStatus)) {
            vipActivationService.createVipActivation(user);            
            log.info("Vip activation created updated for: {}", user.getLogin());
        } else {
            log.info("Payment not approved for user {}, status: {}", user.getLogin(), paymentStatus);
        }
    }

    private void handleProcessingError(WebhookEvent event) {
        event.setRetryCount(event.getRetryCount() + 1);
        if (event.getRetryCount() >= MAX_RETRY_COUNT) {
            event.setStatus(EventStatus.ERROR);
        }
        webhookRepository.save(event);
    }

    @Transactional
    public WebhookEvent saveWebhookEvent(WebhookEvent webhookEvent) {
        return webhookRepository.save(webhookEvent);
    }

    /**
     * Valida a assinatura de um webhook do Mercado Pago conforme a documentação
     * oficial.
     * 
     * @param xSignature O valor do header x-signature da requisição
     * @param xRequestId O valor do header x-request-id da requisição
     * @param dataId     O ID do recurso recebido no parâmetro de consulta data.id
     * @param secret     A chave secreta fornecida pelo Mercado Pago (se nula usará
     *                   a configurada)
     * @return true se a assinatura for válida, false caso contrário
     */
    public boolean validateSignature(String xSignature, String xRequestId, String dataId, String secret) {
        log.debug("Validando assinatura - RequestId: {}, DataId: {}", xRequestId, dataId);

        // Use configured secret if not provided
        String secretKey = (secret != null && !secret.isEmpty()) ? secret : webhookSecret;

        if (secretKey == null || secretKey.isEmpty()) {
            log.error("Webhook secret is not configured");
            return false;
        }

        try {
            // 1. Extrair o timestamp (ts) e a assinatura (v1) do header x-signature
            Map<String, String> signatureComponents = parseSignatureHeader(xSignature);
            String ts = signatureComponents.get("ts");
            String hash = signatureComponents.get("v1");

            if (ts == null || hash == null) {
                log.error("Componentes da assinatura (ts ou v1) não encontrados no header");
                return false;
            }

            // 2. Construir o template conforme a documentação
            String message = buildSignatureTemplate(dataId, xRequestId, ts);
            log.debug("Template gerado para validação: {}", message);

            // 3. Calcular o HMAC SHA-256 usando a chave secreta
            String calculatedHash = calculateHmacSha256(message, secretKey);

            // 4. Verificar se a assinatura calculada corresponde à recebida
            boolean isValid = calculatedHash.equals(hash);

            if (isValid) {
                log.info("Assinatura válida para RequestId: {}", xRequestId);
            } else {
                log.warn("Assinatura inválida - Calculada: {}, Recebida: {}", calculatedHash, hash);
            }

            return isValid;

        } catch (Exception e) {
            log.error("Erro ao validar assinatura", e);
            return false;
        }
    }

    private Map<String, String> parseSignatureHeader(String xSignature) {
        Map<String, String> components = new java.util.HashMap<>();

        if (xSignature == null || xSignature.isEmpty()) {
            return components;
        }

        String[] parts = xSignature.split(",");
        for (String part : parts) {
            String[] keyValue = part.split("=", 2);
            if (keyValue.length == 2) {
                String key = keyValue[0].trim();
                String value = keyValue[1].trim();
                components.put(key, value);
            }
        }

        return components;
    }

    private String buildSignatureTemplate(String dataId, String xRequestId, String ts) {
        StringBuilder manifest = new StringBuilder();

        // Adicionar id somente se dataId não for nulo ou vazio
        if (dataId != null && !dataId.isEmpty()) {
            manifest.append("id:").append(dataId).append(";");
        }

        // Adicionar request-id somente se xRequestId não for nulo ou vazio
        if (xRequestId != null && !xRequestId.isEmpty()) {
            manifest.append("request-id:").append(xRequestId).append(";");
        }

        // Adicionar ts somente se ts não for nulo ou vazio
        if (ts != null && !ts.isEmpty()) {
            manifest.append("ts:").append(ts).append(";");
        }

        return manifest.toString();
    }

    private String calculateHmacSha256(String message, String secretKey) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hashBytes = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));

        StringBuilder calculatedHash = new StringBuilder();
        for (byte b : hashBytes) {
            calculatedHash.append(String.format("%02x", b));
        }

        return calculatedHash.toString();
    }

}