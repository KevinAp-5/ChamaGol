package com.chamagol.infra.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@EnableWebSecurity
@Configuration
public class SecurityConfigurations {
	private SecurityFilter securityFilter;
	private static final String MESTRE = "MESTRE";

	public SecurityConfigurations(SecurityFilter securityFilter) {
		this.securityFilter = securityFilter;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
		return httpSecurity.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(management -> management
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(requests -> requests
						// Autenticação e Registro
						.requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
						// .requestMatchers(HttpMethod.GET, "/api/auth/register/confirm").permitAll()
	
						// Rotas para MESTRE
						.requestMatchers(HttpMethod.POST, "/api/sinal").hasRole(MESTRE)
						.requestMatchers(HttpMethod.DELETE, "/api/sinal/*").hasRole(MESTRE)
						.requestMatchers(HttpMethod.PUT, "/api/users/*/activate").hasRole(MESTRE)
	
						// Rotas Administrativas
						.requestMatchers(HttpMethod.DELETE, "/api/users/*/hard").hasRole("ADMIN")
	
						// Padrão para outros endpoints
						.anyRequest().authenticated())
				.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
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