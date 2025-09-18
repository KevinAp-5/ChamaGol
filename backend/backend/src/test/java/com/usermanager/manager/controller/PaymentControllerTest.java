package com.usermanager.manager.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.ZonedDateTime;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.ConcurrentModel;
import org.springframework.ui.Model;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.usermanager.manager.infra.service.WebhookService;
import com.usermanager.manager.model.webhook.WebhookEvent;
import com.usermanager.manager.model.webhook.enums.EventStatus;
import com.usermanager.manager.service.user.UserService;

class PaymentControllerTest {

    @Mock
    private WebhookService webhookService;

    @Mock
    private PreferenceClient preferenceClient;

    @Mock
    private UserService userService;

    @InjectMocks
    private PaymentController paymentController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        paymentController = new PaymentController(webhookService, userService, preferenceClient);
        org.springframework.test.util.ReflectionTestUtils.setField(paymentController, "mercadoPagoSecret", "test_secret");
    }

    @Test
    void testReceiveWebhook_ValidSignature() throws Exception {
        // Setup
        String xRequestId = "req-1";
        String dataId = "42";
        String ts = "123456789";
        String secret = "test_secret";
        String xSignature = generateValidSignature(dataId, xRequestId, ts, secret);

        Map<String, String> queryParams = Map.of("data.id", dataId);
        Map<String, Object> payload = Map.of("data", Map.of("id", 42));
        WebhookEvent event = new WebhookEvent();
        event.setId(1L);
        event.setStatus(EventStatus.PENDING);
        event.setPayloadJson(new ObjectMapper().writeValueAsString(payload));
        event.setReceivedAt(ZonedDateTime.now());

        // Mock do WebhookService para validar a assinatura
        when(webhookService.validateSignature(xSignature, xRequestId, dataId, "test_secret")).thenReturn(true);
        when(webhookService.saveWebhookEvent(any(WebhookEvent.class))).thenReturn(event);

        // Act
        ResponseEntity<String> response = paymentController.receiveWebhook(
                xSignature, xRequestId, queryParams, payload);

        // Assert
        assertEquals(200, response.getStatusCodeValue());  // Changed to 200 for valid signature
        assertTrue(response.getBody().contains("Notificação recebida com sucesso")); // Added message check
        verify(webhookService).validateSignature(xSignature, xRequestId, dataId, "test_secret");
        verify(webhookService).saveWebhookEvent(any(WebhookEvent.class));
    }

    @Test
    void testReceiveWebhook_InvalidSignature() {
        String xSignature = "ts=123,v1=invalid";
        String xRequestId = "req-2";
        String dataId = "99";
        Map<String, String> queryParams = Map.of("data.id", dataId);
        Map<String, Object> payload = Map.of("data", Map.of("id", 99));

        ResponseEntity<String> response = paymentController.receiveWebhook(
                xSignature, xRequestId, queryParams, payload);

        assertEquals(401, response.getStatusCodeValue());
        assertTrue(response.getBody().contains("Assinatura inválida"));
        verify(webhookService, never()).saveWebhookEvent(any());
    }

    @Test
    void testReceiveWebhook_ExceptionHandling() throws Exception {
        // Setup
        String xRequestId = "req-3";
        String dataId = "100";
        String ts = "123456789";
        String secret = "test_secret";
        String xSignature = generateValidSignature(dataId, xRequestId, ts, secret);

        Map<String, String> queryParams = Map.of("data.id", dataId);
        Map<String, Object> payload = Map.of("data", Map.of("id", 100));

        // Mock do WebhookService para validar a assinatura
        when(webhookService.validateSignature(xSignature, xRequestId, dataId, "test_secret")).thenReturn(true);
        when(webhookService.saveWebhookEvent(any())).thenThrow(new RuntimeException("DB error"));

        // Act
        ResponseEntity<String> response = paymentController.receiveWebhook(
                xSignature, xRequestId, queryParams, payload);

        // Assert
        assertEquals(500, response.getStatusCodeValue());  // Changed to 500 for exception
        assertTrue(response.getBody().contains("Erro no processamento")); // Updated expected message
        verify(webhookService).validateSignature(xSignature, xRequestId, dataId, "test_secret");
    }

    @Test
    void testCreatePayment_Unauthorized() throws Exception {
        ResponseEntity<String> response = paymentController.createPayment(null);
        assertEquals(401, response.getStatusCodeValue());
        assertTrue(response.getBody().contains("unauthorized"));
    }

    @Test
    void testCreatePayment_Success() throws Exception {
        // Arrange
        com.usermanager.manager.model.user.User user = new com.usermanager.manager.model.user.User();
        user.setId(123L);
        Preference preference = mock(Preference.class);
        when(preference.getInitPoint()).thenReturn("pref-123");
        when(preferenceClient.create(any())).thenReturn(preference);

        // Act
        ResponseEntity<String> response = paymentController.createPayment(user);

        // Assert
        assertEquals(HttpStatusCode.valueOf(200), response.getStatusCode());
        assertEquals("pref-123", response.getBody());
    }

    @Test
    void testCreatePayment_MercadoPagoApiException() throws Exception {
        com.usermanager.manager.model.user.User user = new com.usermanager.manager.model.user.User();
        user.setId(123L);
        MPApiException apiException = mock(MPApiException.class);
        when(apiException.getApiResponse()).thenReturn(mock(com.mercadopago.net.MPResponse.class));
        when(preferenceClient.create(any())).thenThrow(apiException);

        ResponseEntity<String> response = paymentController.createPayment(user);

        assertEquals(500, response.getStatusCodeValue());
        assertTrue(response.getBody().contains("Erro no gateway de pagamento"));
    }

    @Test
    void testCreatePayment_MercadoPagoGeneralException() throws Exception {
        com.usermanager.manager.model.user.User user = new com.usermanager.manager.model.user.User();
        user.setId(123L);
        when(preferenceClient.create(any())).thenThrow(new MPException("General error"));

        ResponseEntity<String> response = paymentController.createPayment(user);

        assertEquals(500, response.getStatusCodeValue());
        assertTrue(response.getBody().contains("Erro no processamento do pagamento"));
    }

    @Test
    void testSuccessCallback() {
        Model model = new ConcurrentModel();
        String view = paymentController.success(model);
        assertEquals("payment-result", view);
        assertEquals("success", model.getAttribute("status"));
        assertEquals("Pagamento Aprovado", model.getAttribute("title"));
    }

    @Test
    void testFailureCallback() {
        Model model = new ConcurrentModel();
        String view = paymentController.failure(model);
        assertEquals("payment-result", view);
        assertEquals("failure", model.getAttribute("status"));
        assertEquals("Pagamento Recusado", model.getAttribute("title"));
    }

    @Test
    void testPendingCallback() {
        Model model = new ConcurrentModel();
        String view = paymentController.pending(model);
        assertEquals("payment-result", view);
        assertEquals("pending", model.getAttribute("status"));
        assertEquals("Pagamento Pendente", model.getAttribute("title"));
    }

    // Adicione este método utilitário na sua classe de teste:
    private String generateValidSignature(String dataId, String xRequestId, String ts, String secret) throws Exception {
        String message = String.format("id:%s;request-id:%s;ts:%s;", dataId, xRequestId, ts);
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(secretKey);
        byte[] hashBytes = mac.doFinal(message.getBytes());
        StringBuilder hashHex = new StringBuilder();
        for (byte b : hashBytes) {
            hashHex.append(String.format("%02x", b));
        }
        return "ts=" + ts + ",v1=" + hashHex.toString();
    }
}