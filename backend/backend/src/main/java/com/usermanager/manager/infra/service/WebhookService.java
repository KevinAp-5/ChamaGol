package com.usermanager.manager.infra.service;

import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercadopago.client.merchantorder.MerchantOrderClient;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.merchantorder.MerchantOrder;
import com.mercadopago.resources.payment.Payment;
import com.usermanager.manager.enums.Subscription;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.webhook.WebhookEvent;
import com.usermanager.manager.model.webhook.enums.EventStatus;
import com.usermanager.manager.repository.WebhookEventsRepository;
import com.usermanager.manager.service.user.UserService;

import lombok.extern.slf4j.Slf4j;

@Service
@EnableScheduling
@Slf4j
public class WebhookService {
    private final WebhookEventsRepository webhookRepository;
    private final UserService userService;
    private PaymentClient paymentClient;

    public WebhookService(WebhookEventsRepository webhookRepository, UserService userService) {
        this.webhookRepository = webhookRepository;
        this.userService = userService;
        this.paymentClient = new PaymentClient();
    }

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void processWebhookEvents() {
        List<WebhookEvent> pendingEvents = webhookRepository.findByStatusAndRetryCountLessThan(EventStatus.PENDING, 5);

        for (WebhookEvent event : pendingEvents) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> payload = mapper.readValue(event.getPayloadJson(), new TypeReference<Map<String, Object>>() {});

                if (payload == null || !payload.containsKey("data") || payload.get("data") == null) {
                    log.warn("Webhook event with null or missing data: eventId={}", event.getId());
                    event.setStatus(EventStatus.ERROR);
                    webhookRepository.save(event);
                    continue;
                }

                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                if (!data.containsKey("id") || data.get("id") == null) {
                    log.warn("Webhook event data missing 'id': eventId={}", event.getId());
                    event.setStatus(EventStatus.ERROR);
                    webhookRepository.save(event);
                    continue;
                }

                String paymentIdStr = String.valueOf(data.get("id"));
                Long paymentId = Long.valueOf(paymentIdStr);
                log.info("Processing payment ID: {}", paymentId);

                Payment paymentStatus = paymentClient.get(paymentId);
                if (paymentStatus == null) {
                    log.warn("Payment not found for ID: {}", paymentId);
                    event.setStatus(EventStatus.ERROR);
                    webhookRepository.save(event);
                    continue;
                }
                log.info("Payment {} status: {}", paymentId, paymentStatus.getStatus());

                if (paymentStatus.getOrder() == null || paymentStatus.getOrder().getId() == null) {
                    log.warn("Payment order or order ID is null for paymentId={}", paymentId);
                    event.setStatus(EventStatus.ERROR);
                    webhookRepository.save(event);
                    continue;
                }

                Long merchantOrderId = paymentStatus.getOrder().getId();
                MerchantOrderClient merchantOrderClient = new MerchantOrderClient();
                MerchantOrder merchantOrder = merchantOrderClient.get(merchantOrderId);

                if (merchantOrder == null || merchantOrder.getExternalReference() == null) {
                    log.warn("Merchant order or external_reference is null for merchantOrderId={}", merchantOrderId);
                    event.setStatus(EventStatus.ERROR);
                    webhookRepository.save(event);
                    continue;
                }

                Long userId = Long.valueOf(merchantOrder.getExternalReference());
                User user = null;
                try {
                    user = userService.findById(userId);
                } catch (Exception ex) {
                    log.warn("User not found with id {}: {}", userId, ex.getMessage());
                }

                if (user == null) {
                    log.warn("User not found with id {}", userId);
                    event.setStatus(EventStatus.PROCESSED);
                    webhookRepository.save(event);
                    continue;
                }

                if ("approved".equalsIgnoreCase(paymentStatus.getStatus())) {
                    user.setSubscription(Subscription.PRO);
                    userService.save(user);
                    log.info("User subscription updated to PRO: {}", user.getLogin());
                } else {
                    log.info("Payment not approved for user {}", user.getLogin());
                }

                event.setStatus(EventStatus.PROCESSED);
                event.setProcessedAt(ZonedDateTime.now());
            } catch (Exception e) {
                log.error("Error processing webhook event id {}: {}", event.getId(), e.getMessage(), e);
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) {
                    event.setStatus(EventStatus.ERROR);
                }
                webhookRepository.save(event);
                continue;
            }
            webhookRepository.save(event);
        }
    }

    @Transactional
    public WebhookEvent saveWebhookEvent(WebhookEvent webhookEvent) {
        return webhookRepository.save(webhookEvent);
    }


    /**
     * Valida a assinatura de um webhook do Mercado Pago conforme a documentação oficial.
     * 
     * @param xSignature O valor do header x-signature da requisição
     * @param xRequestId O valor do header x-request-id da requisição
     * @param dataId O ID do recurso recebido no parâmetro de consulta data.id
     * @param secret A chave secreta fornecida pelo Mercado Pago
     * @return true se a assinatura for válida, false caso contrário
     */
    public boolean validateSignature(String xSignature, String xRequestId, String dataId, String secret) {
        log.debug("Validando assinatura - RequestId: {}, DataId: {}", xRequestId, dataId);

        try {
            // 1. Extrair o timestamp (ts) e a assinatura (v1) do header x-signature
            String[] parts = xSignature.split(",");
            String ts = null;
            String hash = null;
            
            for (String part : parts) {
                String[] keyValue = part.split("=", 2);
                if (keyValue.length == 2) {
                    String key = keyValue[0].trim();
                    String value = keyValue[1].trim();
                    
                    if (key.equals("ts")) {
                        ts = value;
                    } else if (key.equals("v1")) {
                        hash = value;
                    }
                }
            }

            if (ts == null || hash == null) {
                log.error("Componentes da assinatura (ts ou v1) não encontrados no header");
                return false;
            }

            // 2. Construir o template conforme a documentação
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
            
            String message = manifest.toString();
            log.debug("Template gerado para validação: {}", message);

            // 3. Calcular o HMAC SHA-256 usando a chave secreta
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hashBytes = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            
            // 4. Converter o resultado para hexadecimal
            StringBuilder calculatedHash = new StringBuilder();
            for (byte b : hashBytes) {
                calculatedHash.append(String.format("%02x", b));
            }
            
            // 5. Verificar se a assinatura calculada corresponde à recebida
            boolean isValid = calculatedHash.toString().equals(hash);
            
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

}