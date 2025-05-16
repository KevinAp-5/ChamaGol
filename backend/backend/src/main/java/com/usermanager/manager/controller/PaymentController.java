package com.usermanager.manager.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferencePaymentMethodsRequest;
import com.mercadopago.client.preference.PreferencePaymentTypeRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payment")
@Slf4j
public class PaymentController {
    @Value("${mercadopago.webhook.secret.token}")
    private static String MERCADO_PAGO_SECRET;

    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(
            @RequestHeader("x-signature") String xSignature,
            @RequestHeader("x-request-id") String xRequestId,
            @RequestParam Map<String, String> queryParams,
            @RequestBody Map<String, Object> payload) {

        log.info("Webhook received - RequestId: {}, Signature: {}", xRequestId, xSignature);
        log.debug("Query params: {}", queryParams);
        log.debug("Payload: {}", payload);

        try {
            String dataId = queryParams.get("data.id");
            log.info("Processing webhook for dataId: {}", dataId);

            if (!validateSignature(xSignature, xRequestId, dataId, MERCADO_PAGO_SECRET)) {
                log.error("Invalid signature for request ID: {}", xRequestId);
                return ResponseEntity.status(401).body("Assinatura inválida");
            }

            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data != null) {
                String paymentId = String.valueOf(data.get("id"));
                log.info("Processing payment ID: {}", paymentId);

                PaymentClient client = new PaymentClient();
                Payment payment_status = client.get(Long.valueOf(paymentId));
                log.info("Payment {} status: {}", paymentId, payment_status.getStatus());
                log.debug("Full payment details: {}", payment_status);
            } else {
                log.warn("Received webhook with null data");
            }

            return ResponseEntity.ok("Notificação recebida");

        } catch (Exception e) {
            log.error("Error processing webhook", e);
            return ResponseEntity.status(500).body("Erro no processamento");
        }
    }

    private boolean validateSignature(String xSignature, String xRequestId, String dataId, String secret) {
        log.debug("Validating signature - RequestId: {}, DataId: {}", xRequestId, dataId);
        
        try {
            String[] parts = xSignature.split(",");
            String ts = null;
            String v1 = null;
            
            for (String part : parts) {
                String[] kv = part.split("=");
                if (kv.length == 2) {
                    if (kv[0].trim().equals("ts"))
                        ts = kv[1].trim();
                    else if (kv[0].trim().equals("v1"))
                        v1 = kv[1].trim();
                }
            }

            if (ts == null || v1 == null) {
                log.error("Missing timestamp or signature components");
                return false;
            }

            String message = String.format("id:%s;request-id:%s;ts:%s;", dataId, xRequestId, ts);
            log.debug("Generated message for signature: {}", message);

            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hashBytes = mac.doFinal(message.getBytes());
            StringBuilder hashHex = new StringBuilder();
            for (byte b : hashBytes) {
                hashHex.append(String.format("%02x", b));
            }

            boolean isValid = hashHex.toString().equals(v1);
            log.info("Signature validation result: {}", isValid);
            return isValid;

        } catch (Exception e) {
            log.error("Error validating signature", e);
            return false;
        }
    }

    @PostMapping("/create")
    public ResponseEntity<String> createPayment() throws MPException {
        log.info("Initiating payment creation");
        PreferenceClient client = new PreferenceClient();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(PreferenceItemRequest.builder()
                .title("Assinatura teste")
                .quantity(1)
                .unitPrice(new BigDecimal("00.01"))
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
                        .email("comprador@teste.com")
                        .build())
                .backUrls(PreferenceBackUrlsRequest.builder()
                        .success("https://chamagol-9gfb.onrender.com/api/payment/success")
                        .failure("https://chamagol-9gfb.onrender.com/api/payment/failure")
                        .pending("https://chamagol-9gfb.onrender.com/api/payment/pending")
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
