package com.usermanager.manager.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mercadopago.exceptions.MPException;
import com.usermanager.manager.dto.payment.PreferenceResponse;
import com.usermanager.manager.dto.payment.UserSubscriptionResponse;
import com.usermanager.manager.dto.payment.WebhookRequest;
import com.usermanager.manager.dto.payment.WebhookResponse;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.payment.PaymentService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payment")
@Slf4j
@AllArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/status")
    public ResponseEntity<String> getUserSubscriptionStatus(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body("unathorized");
        }

        UserSubscriptionResponse response = paymentService.getUserSubscription(user.getId());

        return ResponseEntity.status(200).body(response.subscription().toString());
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId,
            @RequestParam Map<String, String> queryParams,
            @RequestBody Map<String, Object> payload) {
        WebhookRequest request = new WebhookRequest(xSignature, xRequestId, queryParams, payload);
        WebhookResponse response = paymentService.createPaymentProcessing(request);
        return ResponseEntity.status(response.httpStatus()).body(response.bodyMessage());
    }

    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@AuthenticationPrincipal User user) throws MPException {
        if (user == null) {
            return ResponseEntity.status(401).body("unauthorized");
        }

        log.info("Initiating payment creation");
        PreferenceResponse paymentLink = paymentService.createPayment(user.getId());
        return ResponseEntity.ok(paymentLink.paymentLink());
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
