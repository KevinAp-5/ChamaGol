package com.usermanager.manager.infra.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
@Profile("!prod")
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Chamagol API")
                        .version("1.0")
                        .description("Documentação da API do Chamagol"));
    }

    @Bean
    public GroupedOpenApi restApi() {
        return GroupedOpenApi.builder()
                .group("*")
                .pathsToMatch("/**")
                .build();
    }
}