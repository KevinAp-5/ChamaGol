package com.chamagol.service.user;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UsuarioCacheService {
    private final UsuarioService usuarioService;

    public UsuarioCacheService(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Cacheable(value = "usuario", key = "#email")
    public UserDetails getUsuarioFromCache(String email) {
        log.debug("Cache miss para usuário: {}", email);
        return usuarioService.getUsuario(email);
    }
}
