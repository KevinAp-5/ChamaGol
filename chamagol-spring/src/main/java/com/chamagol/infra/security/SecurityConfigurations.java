package com.chamagol.infra.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@EnableWebSecurity
@Configuration
public class SecurityConfigurations {

    private final SecurityFilter securityFilter;
    private static final String MESTRE = "MESTRE";

    public SecurityConfigurations(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                // Habilita CSRF com CookieCsrfTokenRepository
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        // Ignora CSRF para endpoints que usam Access Token no header
                        .ignoringRequestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/password/reset",
                                "/api/auth/password/reset/confirm",
                                "/api/auth/email/confirmed",
                                "/api/auth/register/confirm",
                                "/api/auth/password/reset/confirmEmail",
                                "/api/sinal/**",
                                "/api/users/**",
                                "/api/runningMessage",
                                "/images/**"))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Configura sessões Stateless
                .authorizeHttpRequests(requests -> requests
                        // Permitir acesso sem autenticação para estas rotas
                        .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/register/confirm**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/password/reset/confirm**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/email/confirmed").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/runningMessage").permitAll()
                        .requestMatchers(HttpMethod.GET, "/images/**").permitAll()

                        // Acesso restrito para MESTRE
                        .requestMatchers(HttpMethod.POST, "/api/sinal").hasRole(MESTRE)
                        .requestMatchers(HttpMethod.DELETE, "/api/sinal/*").hasRole(MESTRE)
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/activate").hasRole(MESTRE)

                        // Acesso restrito para MESTRE e ADMIN
                        .requestMatchers("/api/users**").hasAnyRole("MESTRE", "ADMIN")
                        .requestMatchers("/api/users/**").hasAnyRole("MESTRE", "ADMIN")

                        // Todas as outras requisições devem ser autenticadas
                        .anyRequest().authenticated())
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class) // Adiciona filtro
                                                                                             // customizado
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
