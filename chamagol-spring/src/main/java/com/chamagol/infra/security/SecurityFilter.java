package com.chamagol.infra.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.chamagol.service.auth.CachedAuthenticationProvider;
import com.chamagol.service.auth.TokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final CachedAuthenticationProvider cachedAuthenticationProvider;

    public SecurityFilter(TokenService tokenService,
            com.chamagol.service.auth.CachedAuthenticationProvider cachedAuthenticationProvider) {
        this.tokenService = tokenService;
        this.cachedAuthenticationProvider = cachedAuthenticationProvider;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
    
        var token = pegarToken(request);
        if (token != null) {
            var authentication = criarAutenticacao(token);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
    
        filterChain.doFilter(request, response);
    }

    private UsernamePasswordAuthenticationToken criarAutenticacao(String token) {
        var subject = tokenService.getSubject(token);
        UserDetails usuario = cachedAuthenticationProvider.loadUserByUsername(subject);

        return new UsernamePasswordAuthenticationToken(
            usuario,
            null,
            usuario.getAuthorities()
        );
    }

    private String pegarToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) {
            return null;
        }
    
        String[] tokenArray = authHeader.split(" ");
        return tokenArray.length > 1 ? tokenArray[1] : null;
    }
}
