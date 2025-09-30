package com.usermanager.manager.infra.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercadopago.client.merchantorder.MerchantOrderClient;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.merchantorder.MerchantOrder;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.payment.PaymentOrder;
import com.usermanager.manager.infra.mail.MailService;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.webhook.WebhookEvent;
import com.usermanager.manager.model.webhook.enums.EventStatus;
import com.usermanager.manager.repository.WebhookEventsRepository;
import com.usermanager.manager.service.user.UserService;
import com.usermanager.manager.service.vip_activation.VipActivationService;

class WebhookServiceTest {

    @Mock
    private WebhookEventsRepository webhookRepository;
    @Mock
    private UserService userService;
    @Mock
    private PaymentClient paymentClient;
    @Mock
    private MerchantOrderClient merchantOrderClient;

    @Mock
    private VipActivationService vipActivationService;

    @Mock
    private MailService mailService;

    @InjectMocks
    private WebhookService webhookService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        webhookService = new WebhookService(webhookRepository, userService, vipActivationService, mailService);
        // Injeta o mock do PaymentClient na instância real
        ReflectionTestUtils.setField(webhookService, "paymentClient", paymentClient);
    }

    private WebhookEvent buildEvent(Long id, String payload, EventStatus status, int retryCount) {
        WebhookEvent event = new WebhookEvent();
        event.setId(id);
        event.setPayloadJson(payload);
        event.setStatus(status);
        event.setRetryCount(retryCount);
        return event;
    }

    @Test
    void testProcessWebhookEvents_SuccessfulApprovedPayment() throws Exception {
        // Arrange
        Long paymentId = 123L;
        Long merchantOrderId = 456L;
        Long userId = 789L;
        String payload = new ObjectMapper().writeValueAsString(
                Map.of("data", Map.of("id", paymentId)));
        WebhookEvent event = buildEvent(1L, payload, EventStatus.PENDING, 0);

        when(webhookRepository.findByStatusAndRetryCountLessThan(EventStatus.PENDING, 5))
                .thenReturn(List.of(event));

        Payment payment = mock(Payment.class);
        PaymentOrder paymentOrder = mock(PaymentOrder.class);
        when(payment.getStatus()).thenReturn("approved");
        when(payment.getOrder()).thenReturn(paymentOrder);
        when(paymentOrder.getId()).thenReturn(merchantOrderId);
        when(paymentClient.get(paymentId)).thenReturn(payment);

        MerchantOrder merchantOrder = mock(MerchantOrder.class);
        when(merchantOrder.getExternalReference()).thenReturn(userId.toString());

        // Simule o retorno do usuário como vazio para forçar erro (ou ajuste conforme seu fluxo real)
        when(userService.findByIdOptional(userId)).thenReturn(java.util.Optional.empty());
        when(webhookRepository.save(any(WebhookEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        webhookService.processWebhookEvents();

        // Assert: evento deve ficar como PENDING e retryCount incrementado
        verify(userService, never()).save(any());
        verify(webhookRepository).save(argThat(e -> e.getStatus() == EventStatus.PENDING && e.getRetryCount() == 1));
    }

    @Test
    void testProcessWebhookEvents_PaymentNotApproved() throws Exception {
        Long paymentId = 123L;
        Long merchantOrderId = 456L;
        Long userId = 789L;
        String payload = new ObjectMapper().writeValueAsString(
                Map.of("data", Map.of("id", paymentId)));
        WebhookEvent event = buildEvent(2L, payload, EventStatus.PENDING, 0);

        when(webhookRepository.findByStatusAndRetryCountLessThan(EventStatus.PENDING, 5))
                .thenReturn(List.of(event));

        Payment payment = mock(Payment.class);
        PaymentOrder paymentOrder = mock(PaymentOrder.class);
        when(payment.getStatus()).thenReturn("rejected");
        when(payment.getOrder()).thenReturn(paymentOrder);
        when(paymentOrder.getId()).thenReturn(merchantOrderId);
        when(paymentClient.get(paymentId)).thenReturn(payment);

        MerchantOrder merchantOrder = mock(MerchantOrder.class);
        when(merchantOrder.getExternalReference()).thenReturn(userId.toString());

        when(userService.findByIdOptional(userId)).thenReturn(java.util.Optional.of(new User()));
        when(webhookRepository.save(any(WebhookEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        webhookService.processWebhookEvents();

        verify(userService, never()).save(any());
        verify(webhookRepository).save(argThat(e -> e.getStatus() == EventStatus.PENDING && e.getRetryCount() == 1));
    }

    @Test
    void testProcessWebhookEvents_UserNotFound() throws Exception {
        Long paymentId = 123L;
        Long merchantOrderId = 456L;
        Long userId = 789L;
        String payload = new ObjectMapper().writeValueAsString(
                Map.of("data", Map.of("id", paymentId)));
        WebhookEvent event = buildEvent(3L, payload, EventStatus.PENDING, 0);

        when(webhookRepository.findByStatusAndRetryCountLessThan(EventStatus.PENDING, 5))
                .thenReturn(List.of(event));

        Payment payment = mock(Payment.class);
        PaymentOrder paymentOrder = mock(PaymentOrder.class);
        when(payment.getStatus()).thenReturn("approved");
        when(payment.getOrder()).thenReturn(paymentOrder);
        when(paymentOrder.getId()).thenReturn(merchantOrderId);
        when(paymentClient.get(paymentId)).thenReturn(payment);

        MerchantOrder merchantOrder = mock(MerchantOrder.class);
        when(merchantOrder.getExternalReference()).thenReturn(userId.toString());

        try (MockedConstruction<MerchantOrderClient> ignored = Mockito.mockConstruction(MerchantOrderClient.class,
                (mock, context) -> {
                    when(mock.get(merchantOrderId)).thenReturn(merchantOrder);
                })) {

            when(userService.findByIdOptional(userId)).thenReturn(java.util.Optional.empty());
            when(webhookRepository.save(any(WebhookEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

            webhookService.processWebhookEvents();

            verify(userService, never()).save(any());
            // Espera-se que o evento seja marcado como erro (retryCount incrementado)
            verify(webhookRepository).save(argThat(e -> e.getRetryCount() == 1 && e.getStatus() == EventStatus.PENDING));
        }
    }

    @Test
    void testProcessWebhookEvents_NullDataInPayload() throws Exception {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("data", null);
        String payload = new ObjectMapper().writeValueAsString(map);
        WebhookEvent event = buildEvent(6L, payload, EventStatus.PENDING, 0);

        when(webhookRepository.findByStatusAndRetryCountLessThan(EventStatus.PENDING, 5))
                .thenReturn(List.of(event));
        when(webhookRepository.save(any(WebhookEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        webhookService.processWebhookEvents();

        // Espera-se que o evento seja marcado como erro (retryCount incrementado)
        verify(webhookRepository).save(argThat(e -> e.getRetryCount() == 1 && e.getStatus() == EventStatus.PENDING));
    }
}