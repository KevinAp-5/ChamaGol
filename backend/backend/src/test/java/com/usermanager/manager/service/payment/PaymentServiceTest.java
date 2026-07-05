package com.usermanager.manager.service.payment;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import com.usermanager.manager.dto.payment.PreferenceResponse;
import com.usermanager.manager.dto.payment.UserSubscriptionResponse;
import com.usermanager.manager.dto.payment.WebhookRequest;
import com.usermanager.manager.dto.payment.WebhookResponse;
import com.usermanager.manager.enums.Subscription;
import com.usermanager.manager.infra.service.WebhookService;
import com.usermanager.manager.model.sale.Sale;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.webhook.WebhookEvent;
import com.usermanager.manager.model.webhook.enums.EventStatus;
import com.usermanager.manager.service.payment.impl.PaymentServiceImpl;
import com.usermanager.manager.service.sale.SaleService;
import com.usermanager.manager.service.user.UserService;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private WebhookService webhookService;

    @Mock
    private ApplicationEventPublisher publisher;

    @Mock
    private UserService userService;

    @Mock
    private SaleService saleService;

    @Mock
    private PreferenceClient preferenceClient;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Sale activeSale;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "mercadoPagoSecret", "test_secret");

        activeSale = new Sale();
        activeSale.setId(1L);
        activeSale.setName("Oferta Teste");
        activeSale.setSalePrice(new BigDecimal("99.90"));
        activeSale.setUserSubscriptionTime(30);
    }

    @Test
    void createPaymentProcessing_ShouldReturnSuccess_WhenSignatureIsValid() {
        String xSignature = "ts=123,v1=valid";
        String xRequestId = "req-1";
        String dataId = "42";

        WebhookRequest request = new WebhookRequest(
                xSignature,
                xRequestId,
                Map.of("data.id", dataId),
                Map.of("data", Map.of("id", 42)));

        WebhookEvent savedEvent = new WebhookEvent();
        savedEvent.setId(1L);
        savedEvent.setStatus(EventStatus.PENDING);
        savedEvent.setReceivedAt(ZonedDateTime.now());

        when(webhookService.validateSignature(xSignature, xRequestId, dataId, "test_secret")).thenReturn(true);
        when(webhookService.saveWebhookEvent(any(WebhookEvent.class))).thenReturn(savedEvent);

        WebhookResponse response = paymentService.createPaymentProcessing(request);

        assertAll(
                () -> assertEquals(200, response.httpStatus()),
                () -> assertEquals("Notificação recebida com sucesso.", response.bodyMessage()));

        verify(webhookService).validateSignature(xSignature, xRequestId, dataId, "test_secret");
        verify(webhookService).saveWebhookEvent(any(WebhookEvent.class));
        verify(publisher).publishEvent(any(WebhookEvent.class));
    }

    @Test
    void createPaymentProcessing_ShouldReturnUnauthorized_WhenSignatureIsInvalid() {
        String xSignature = "ts=123,v1=invalid";
        String xRequestId = "req-2";
        String dataId = "99";

        WebhookRequest request = new WebhookRequest(
                xSignature,
                xRequestId,
                Map.of("data.id", dataId),
                Map.of("data", Map.of("id", 99)));

        when(webhookService.validateSignature(xSignature, xRequestId, dataId, "test_secret")).thenReturn(false);

        WebhookResponse response = paymentService.createPaymentProcessing(request);

        assertAll(
                () -> assertEquals(401, response.httpStatus()),
                () -> assertEquals("Assinatura inválida", response.bodyMessage()));

        verify(webhookService).validateSignature(xSignature, xRequestId, dataId, "test_secret");
        verify(webhookService, never()).saveWebhookEvent(any());
        verify(publisher, never()).publishEvent(any());
    }

    @Test
    void createPaymentProcessing_ShouldExtractDataIdFromPayload_WhenQueryParamMissing() {
        String xSignature = "ts=123,v1=valid";
        String xRequestId = "req-3";
        String dataId = "123";

        WebhookRequest request = new WebhookRequest(
                xSignature,
                xRequestId,
                Map.of(),
                Map.of("data", Map.of("id", 123)));

        when(webhookService.validateSignature(xSignature, xRequestId, dataId, "test_secret")).thenReturn(true);
        when(webhookService.saveWebhookEvent(any(WebhookEvent.class))).thenReturn(new WebhookEvent());

        WebhookResponse response = paymentService.createPaymentProcessing(request);

        assertEquals(200, response.httpStatus());
        verify(webhookService).validateSignature(xSignature, xRequestId, dataId, "test_secret");
    }

    @Test
    void getUserSubscription_ShouldReturnUserSubscription() {
        User user = new User();
        user.setId(1L);
        user.setSubscription(Subscription.VIP);

        when(userService.findById(1L)).thenReturn(user);

        UserSubscriptionResponse response = paymentService.getUserSubscription(1L);

        assertNotNull(response);
        assertEquals(Subscription.VIP, response.subscription());
    }

    @Test
    void createPayment_ShouldUseActiveSalePrice_WhenActiveSaleExists() throws Exception {
        when(saleService.getActiveSale()).thenReturn(Optional.of(activeSale));

        Preference preference = org.mockito.Mockito.mock(Preference.class);
        when(preference.getInitPoint()).thenReturn("pref-123");
        when(preferenceClient.create(any(PreferenceRequest.class))).thenReturn(preference);

        PreferenceResponse response = paymentService.createPayment(123L);

        ArgumentCaptor<PreferenceRequest> requestCaptor = ArgumentCaptor.forClass(PreferenceRequest.class);
        verify(preferenceClient).create(requestCaptor.capture());

        PreferenceRequest capturedRequest = requestCaptor.getValue();
        assertAll(
                () -> assertEquals("123", capturedRequest.getExternalReference()),
                () -> assertEquals("pref-123", response.paymentLink()),
                () -> assertEquals(1, capturedRequest.getItems().size()),
                () -> assertEquals(new BigDecimal("99.90"), capturedRequest.getItems().get(0).getUnitPrice()));
    }

    @Test
    void createPayment_ShouldUseDefaultPrice_WhenNoActiveSaleExists() throws Exception {
        when(saleService.getActiveSale()).thenReturn(Optional.empty());

        Preference preference = org.mockito.Mockito.mock(Preference.class);
        when(preference.getInitPoint()).thenReturn("pref-456");
        when(preferenceClient.create(any(PreferenceRequest.class))).thenReturn(preference);

        PreferenceResponse response = paymentService.createPayment(456L);

        ArgumentCaptor<PreferenceRequest> requestCaptor = ArgumentCaptor.forClass(PreferenceRequest.class);
        verify(preferenceClient).create(requestCaptor.capture());

        PreferenceRequest capturedRequest = requestCaptor.getValue();
        assertAll(
                () -> assertEquals("456", capturedRequest.getExternalReference()),
                () -> assertEquals("pref-456", response.paymentLink()),
                () -> assertEquals(new BigDecimal("29.00"), capturedRequest.getItems().get(0).getUnitPrice()));
    }
}
