package com.chamagol.infra.security;

import java.io.IOException;

import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.chamagol.service.auth.TokenService;
import com.chamagol.service.user.UsuarioService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    @Lazy
    private final UsuarioService usuarioService;

    public SecurityFilter(TokenService tokenService, UsuarioService usuarioService) {
        this.tokenService = tokenService;
        this.usuarioService = usuarioService;
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
        UserDetails usuario = usuarioService.getUsuario(subject);

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
