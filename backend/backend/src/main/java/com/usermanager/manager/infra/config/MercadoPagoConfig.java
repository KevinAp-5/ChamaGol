package com.usermanager.manager.infra.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.mercadopago.client.preference.PreferenceClient;

import jakarta.annotation.PostConstruct;

@Configuration
public class MercadoPagoConfig {

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        com.mercadopago.MercadoPagoConfig.setAccessToken(accessToken);
    }

    @Bean
    public PreferenceClient getPreferenceClient() {
        return new PreferenceClient();
    }
}
