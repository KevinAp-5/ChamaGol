package com.usermanager.manager.service.payment.impl;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

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
import com.usermanager.manager.dto.payment.PreferenceResponse;
import com.usermanager.manager.dto.payment.UserSubscriptionResponse;
import com.usermanager.manager.dto.payment.WebhookRequest;
import com.usermanager.manager.dto.payment.WebhookResponse;
import com.usermanager.manager.enums.Subscription;
import com.usermanager.manager.exception.webhook.WebhookProcessingException;
import com.usermanager.manager.infra.service.WebhookService;
import com.usermanager.manager.model.sale.Sale;
import com.usermanager.manager.model.webhook.WebhookEvent;
import com.usermanager.manager.model.webhook.enums.EventStatus;
import com.usermanager.manager.service.payment.PaymentService;
import com.usermanager.manager.service.sale.SaleService;
import com.usermanager.manager.service.user.UserService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
@Validated
public class PaymentServiceImpl implements PaymentService {
    @Value("${mercadopago.webhook.secret.token}")
    private String mercadoPagoSecret;

    private final WebhookService webhookService;
    private final ApplicationEventPublisher publisher;
    private final UserService userService;
    private final SaleService saleService;

    @NonNull
    private PreferenceClient preferenceClient;

    @Override
    public WebhookResponse createPaymentProcessing(WebhookRequest request) {
        Map<String, Object> payload;
        try {
            payload = validateWehbook(request);
        } catch (WebhookProcessingException e) {
            return new WebhookResponse(401, e.getMessage());
        }

        WebhookEvent webhookEvent = createWebhookEvent(payload);
        log.info("Evento de webhook salvo: {}", webhookEvent);

        publisher.publishEvent(webhookEvent);
        log.info("Evento de pagamento publicado");

        return new WebhookResponse(200, "Notificação recebida com sucesso.");
    }

    @Override
    public UserSubscriptionResponse getUserSubscription(Long id) {
        Subscription subscription = userService.findById(id).getSubscription();
        return new UserSubscriptionResponse(subscription);
    }

    @Override
    public PreferenceResponse createPayment(Long id) {
        List<PreferenceItemRequest> items = createPaymentItem(id);
        List<PreferencePaymentTypeRequest> excludedPaymentMethods = createExcludedPaymentMethods();
        PreferencePaymentMethodsRequest paymentMethod = createPaymentMethods(excludedPaymentMethods);
        PreferenceRequest preferenceRequest = createPreferenceRequest(items, paymentMethod, id);
        Preference preference = createClientPaymentPreference(preferenceRequest);

        return new PreferenceResponse(preference.getInitPoint());
    }

    // Util methods do createPaaymentItem abaixo
    private List<PreferenceItemRequest> createPaymentItem(Long userId) {
        Sale sale = saleService.getActiveSale().orElse(null);
        BigDecimal unitPrice = (sale != null) ? sale.getSalePrice() : new BigDecimal("29.00");
        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(PreferenceItemRequest.builder()
                .id("subscriptionPRO-" + userId)
                .pictureUrl("https://freeimage.host/i/34hk2ku")
                .title("ChamaGol")
                .description("ChamaGol assinatura PRO")
                .quantity(1)
                .unitPrice(unitPrice)
                .currencyId("BRL")
                .build());
        return items;
    }

    private List<PreferencePaymentTypeRequest> createExcludedPaymentMethods() {
        List<String> paymentMethods = new ArrayList<>(List.of("atm"));

        List<PreferencePaymentTypeRequest> excludedPaymentMethods = new ArrayList<>();
        paymentMethods.forEach(
                method -> excludedPaymentMethods.add(
                        PreferencePaymentTypeRequest.builder().id(method).build()));
        return excludedPaymentMethods;
    }

    private PreferencePaymentMethodsRequest createPaymentMethods(List<PreferencePaymentTypeRequest> excludedMethods) {
        var paymentMethods = PreferencePaymentMethodsRequest.builder()
                .excludedPaymentTypes(excludedMethods)
                .installments(1)
                .build();
        return paymentMethods;
    }

    private PreferenceRequest createPreferenceRequest(List<PreferenceItemRequest> items,
            PreferencePaymentMethodsRequest paymentMethods, Long userId) {
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .paymentMethods(paymentMethods)
                .statementDescriptor("ChamaGol")
                .externalReference(String.valueOf(userId))
                .backUrls(PreferenceBackUrlsRequest.builder()
                        .success("chamagol://payment/success")
                        .failure("chamagol://payment/failure")
                        .pending("chamagol://payment/pending")
                        .build())
                .notificationUrl("https://chamagol.com/api/payment/webhook")
                .autoReturn("approved")
                .build();
        return preferenceRequest;
    }

    private Preference createClientPaymentPreference(PreferenceRequest preferenceRequest) {
        Preference preference = null;
        try {
            preference = preferenceClient.create(preferenceRequest);
            log.info("Payment preference created successfully. ID: {}", preference.getId());
        } catch (MPApiException apiEx) {
            log.error("MercadoPago API error: {}", apiEx.getApiResponse().getContent(), apiEx);
            return null;
        } catch (MPException ex) {
            return null;
        }
        return preference;
    }

    // Util methods do createPaymentProcessing abaiso
    private Map<String, Object> validateWehbook(@Valid @NotNull WebhookRequest request)
            throws WebhookProcessingException {
        String xSignature = request.xSignature();
        String xRequestId = request.xRequestId();
        Map<String, String> queryParams = request.queryParams();
        Map<String, Object> payload = request.payload();

        log.info("Webhook recebido - RequestId: {}, Signature: {}", xRequestId, xSignature);
        log.info("Query params: {}", queryParams);
        log.info("Payload: {}", payload);
        log.debug("Secret configurado: {}", mercadoPagoSecret.substring(0, 3) + "..." +
                (mercadoPagoSecret.length() > 6 ? mercadoPagoSecret.substring(mercadoPagoSecret.length() - 3) : ""));

        String dataId = queryParams.get("data.id");
        if (dataId == null && payload.containsKey("data")) {
            Optional<String> maybeId = extractId(payload);
            if (maybeId.isEmpty()) {
                log.error("data.id não encontrado na requisição. RequestId: {}", xRequestId);
                ;
                throw new WebhookProcessingException("data.id obrigátório");
            }
            dataId = maybeId.get();
        }

        if (xSignature == null || xSignature.trim().isEmpty()) {
            log.error("assinatura em branco, rejeitando. {}", xRequestId);
            throw new WebhookProcessingException("Assinatura em branco, rejeitando");
        }

        if (!webhookService.validateSignature(xSignature, xRequestId, dataId, mercadoPagoSecret)) {
            log.error("Assinatura inválida para request ID: {}", xRequestId);
            throw new WebhookProcessingException("Assinatura inválida");
        }

        return payload;

    }

    private Optional<String> extractId(Map<String, Object> payload) {
        Object dataObject = payload.get("data");
        if (dataObject instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) dataObject;
            if (data.containsKey("id")) {
                return Optional.of(String.valueOf(data.get("id")));
            }
        }
        return Optional.empty();
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
}
