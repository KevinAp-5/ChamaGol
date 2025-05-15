package com.usermanager.manager.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payment")
@Slf4j
public class PaymentController {
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        System.out.println("Recebido webhook do Mercado Pago: " + payload);

        // Exemplo: extrair id do pagamento
        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        if (data != null) {
            String paymentId = (String) data.get("id");
            // Aqui você pode consultar a API do Mercado Pago para confirmar status e atualizar seu sistema
            System.out.println("ID do pagamento: " + paymentId);
        }

        // Retorne 200 para confirmar recebimento
        return ResponseEntity.ok("Webhook recebido");
    }

    @PostMapping("/create")
    public ResponseEntity<String> createPayment() throws MPException {
        PreferenceClient client = new PreferenceClient();

        // Configura itens do pagamento
        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(PreferenceItemRequest.builder()
                .title("Assinatura teste")
                .quantity(1)
                .unitPrice(new BigDecimal("00.01"))
                .build());

        // Configura métodos de pagamento
        List<PreferencePaymentTypeRequest> excludedPaymentTypes = new ArrayList<>();

        excludedPaymentTypes.add(PreferencePaymentTypeRequest.builder().id("ticket").build());
        excludedPaymentTypes.add(PreferencePaymentTypeRequest.builder().id("atm").build());
        PreferencePaymentMethodsRequest paymentMethods = PreferencePaymentMethodsRequest.builder()
                .excludedPaymentTypes(excludedPaymentTypes) // Remove os meios de pagamentos indesejados
                .installments(1) // Pagamento à vista (sem parcelamento)
                .build();

        // Configura preferência
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
                .autoReturn("approved")
                .build();

        // Cria preferência
        try {
            Preference preference = client.create(request);
            log.info("Preferência criada: {}", preference.getId());
            return ResponseEntity.ok(preference.getId());
        } catch (MPApiException apiEx) {
            log.error("Erro na API MP: {}", apiEx.getApiResponse().getContent());
            return ResponseEntity.status(500).body("Erro no gateway de pagamento");
        } catch (MPException ex) {
            log.error("Erro geral MP: {}", ex.getMessage());
            return ResponseEntity.status(500).body("Erro no processamento do pagamento");
        }
    }

    @GetMapping("/success")
    public String success(Model model) {
        model.addAttribute("status", "success");
        model.addAttribute("title", "Pagamento Aprovado");
        model.addAttribute("message", "Seu pagamento foi processado com sucesso. Obrigado pela compra!");
        model.addAttribute("cssClass", "success");
        return "payment-result";
    }

    @GetMapping("/failure")
    public String failure(Model model) {
        model.addAttribute("status", "failure");
        model.addAttribute("title", "Pagamento Recusado");
        model.addAttribute("message", "Houve um problema ao processar seu pagamento. Por favor, tente novamente.");
        model.addAttribute("cssClass", "failure");
        return "payment-result";
    }

    @GetMapping("/pending")
    public String pending(Model model) {
        model.addAttribute("status", "pending");
        model.addAttribute("title", "Pagamento Pendente");
        model.addAttribute("message", "Seu pagamento está pendente. Assim que for confirmado, você será notificado.");
        model.addAttribute("cssClass", "pending");
        return "payment-result";
    }
}
