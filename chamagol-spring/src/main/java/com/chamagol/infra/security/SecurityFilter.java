package com.chamagol.infra.security;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.chamagol.dto.usuario.mapper.UsuarioMapper;
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
    private RedisTemplate<String, Object> redisTemplate;

    public SecurityFilter(TokenService tokenService, UsuarioRepository usuarioRepository,
            RedisTemplate<String, Object> redisTemplate) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
    
        var token = pegarToken(request);
        if (token != null) {
            var authentication = criarAutenticacao(token);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
    
        filterChain.doFilter(request, response);
    }

    @SuppressWarnings("unchecked")
    private UsernamePasswordAuthenticationToken criarAutenticacao(String token) {
        var subject = tokenService.getSubject(token);

        UserDetails usuario = UsuarioMapper.mapFromHashMap((Map<String, Object>)redisTemplate.opsForValue().get("user:" + subject));
        if (usuario == null) {
            // Carrega o usuário diretamente
            usuario = usuarioRepository.findByEmail(subject)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + subject));

            redisTemplate.opsForValue().set("user:" + subject, usuario, Duration.ofMinutes(30));
        }

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
