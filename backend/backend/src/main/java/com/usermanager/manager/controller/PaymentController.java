package com.usermanager.manager.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @PostMapping("/create")
    public ResponseEntity<String> createPayment() throws MPException {
        // Cria cliente do Mercado Pago
        PreferenceClient client = new PreferenceClient();

        // Configura itens do pagamento
        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(PreferenceItemRequest.builder()
                .title("Assinatura teste")
                .quantity(1)
                .unitPrice(new BigDecimal("10.00"))
                .build());

        // Configura preferência
        PreferenceRequest request = PreferenceRequest.builder()
                .items(items)
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
        Preference preference = null;
        try {
            preference = client.create(request);
        } catch (MPException | MPApiException e) {
            throw new RuntimeException("Erro ao gerar preferência" + e.getMessage());
        }

        return ResponseEntity.ok(preference.getId());
    }
}
