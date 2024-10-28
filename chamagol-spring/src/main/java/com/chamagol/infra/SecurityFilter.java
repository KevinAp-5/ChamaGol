package com.chamagol.infra;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.chamagol.repository.UsuarioRepository;
import com.chamagol.service.TokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {
    private TokenService tokenService;
    private UsuarioRepository usuarioRepository;

    public SecurityFilter(TokenService tokenService, UsuarioRepository usuarioRepository) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        var token = pegarToken(request);
        if (token != null && autenticarUsuario(token)) {
            SecurityContextHolder.getContext().setAuthentication(criarAutenticacao(token));
        }

        filterChain.doFilter(request, response);
    }

    private boolean autenticarUsuario(String token) {
        var subject = tokenService.getSubject(token);
        return usuarioRepository.existsByEmail(subject);
    }

    private UsernamePasswordAuthenticationToken criarAutenticacao(String token) {
        var subject = tokenService.getSubject(token);

        UserDetails usuario = usuarioRepository.findByEmail(subject)
        .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));

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

        return tokenArray[1];
    }
}
