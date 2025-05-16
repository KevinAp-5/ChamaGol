package com.usermanager.manager.infra.service;

import java.time.LocalDateTime;
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
            Map<String, Object> payload = mapper.readValue(event.getPayloadJson(), new TypeReference<Map<String,Object>>() {});

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data != null) {
                String paymentIdStr = String.valueOf(data.get("id"));
                Long paymentId = Long.valueOf(paymentIdStr);
                log.info("Processing payment ID: {}", paymentId);

                Payment paymentStatus = paymentClient.get(paymentId);
                log.info("Payment {} status: {}", paymentId, paymentStatus.getStatus());

                // Obter merchant_order via API Mercado Pago, pois pode não vir no webhook
                Long merchantOrderId = paymentStatus.getOrder().getId();
                MerchantOrderClient merchantOrderClient = new MerchantOrderClient();
                MerchantOrder merchantOrder = merchantOrderClient.get(merchantOrderId);

                String externalReference = merchantOrder.getExternalReference();
                if (externalReference != null) {
                    Long userId = Long.valueOf(externalReference);

                    User user = userService.findById(userId);
                    if (user != null) {
                        if ("approved".equalsIgnoreCase(paymentStatus.getStatus())) {
                            user.setSubscription(Subscription.PRO);
                            user = userService.save(user);
                            log.info("User subscription updated to {} : {}", user.getSubscription(), user.getLogin());
                        }
                        else {
                            log.info("payment not approved for user {}", user.getLogin());
                        }
                    } else {
                        log.warn("User not found with id {}", userId);
                    }
                } else {
                    log.warn("external_reference is null for merchant order {}", merchantOrderId);
                }

                event.setStatus(EventStatus.PROCESSED);
                event.setProcessedAt(LocalDateTime.now());
            } else {
                log.warn("Webhook event with null data");
                event.setStatus(EventStatus.ERROR);
            }
        } catch (Exception e) {
            log.error("Error processing webhook event id {}: {}", event.getId(), e.getMessage(), e);
            event.setRetryCount(event.getRetryCount() + 1);
            if (event.getRetryCount() >= 5) {
                event.setStatus(EventStatus.ERROR);
            }
        }

        webhookRepository.save(event);
    }
}

    @Transactional
    public WebhookEvent saveWebhookEvent(WebhookEvent webhookEvent) {
        return webhookRepository.save(webhookEvent);
    }
}
