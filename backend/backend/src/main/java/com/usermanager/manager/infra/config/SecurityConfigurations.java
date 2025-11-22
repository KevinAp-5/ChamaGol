package com.usermanager.manager.infra.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.usermanager.manager.infra.security.filter.SecurityFilter;

@Configuration
public class SecurityConfigurations {

    private final SecurityFilter securityFilter;

    public SecurityConfigurations(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    /**
     * Chain para endpoints públicos (register, confirm, login, ws handshake, swagger, etc.)
     * NÃO registra o SecurityFilter aqui para evitar validação/token checks antes do controller.
     */
    @Bean
    @Order(1)
    public SecurityFilterChain publicSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(
                "/",
                "/api/page/**",
                "/images/**",
                "/css/**",
                "/actuator/**",
                "/swagger-ui/**",
                "/v3/api-docs/**",
                // auth públicos
                "/api/auth/register",
                "/api/auth/register/confirm",
                "/api/auth/login",
                "/api/auth/token/refresh",
                "/api/auth/password/**",
                "/api/auth/activate",
                "/api/auth/email/confirmed",
                // websocket handshake (SockJS)
                "/ws/**",
                "/api/ws/**",
                "/ws/chat/**",
                "/api/ws/chat/**",
                // produto/public
                "/api/payment/**",
                "/api/sale/**"
            )
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );
        return http.build();
    }

    /**
     * Chain principal para o restante da aplicação. Aqui registramos o SecurityFilter.
     */
    @Bean
    @Order(2)
    public SecurityFilterChain appSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline';"))
                .frameOptions(frame -> frame.sameOrigin())
            )
            .authorizeHttpRequests(requests -> requests
                // permissões específicas (rotas que requerem autenticação)
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/auth/user/info").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/auth/token/validate").authenticated()

                // admin/protegidos
                .requestMatchers(HttpMethod.GET, "/api/auth/teste/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                .requestMatchers("/api/signals/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/terms/**").hasRole("ADMIN")

                // CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .anyRequest().authenticated()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpMethod.OPTIONS.matches(request.getMethod()) ? 200 : 401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Not authorized\"}");
                }))
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedHeader("*");
        config.addAllowedOriginPattern("*");
        config.addAllowedOriginPattern("https://chamagol.com");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
