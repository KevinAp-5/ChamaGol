package com.chamagol.service;

import org.springframework.cache.Cache;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.chamagol.interfaces.AuthenticationProvider;
import com.chamagol.repository.UsuarioRepository;

@Service
@Primary
public class CachedAuthenticationProvider implements AuthenticationProvider {
    
    private final UsuarioRepository usuarioRepository;
    private final RedisCacheManager cacheManager;

    public CachedAuthenticationProvider(
            UsuarioRepository usuarioRepository,
            RedisCacheManager cacheManager) {
        this.usuarioRepository = usuarioRepository;
        this.cacheManager = cacheManager;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        Cache cache = cacheManager.getCache("usuario");
        if (cache != null) {
            UserDetails cachedUser = cache.get(username, UserDetails.class);
            if (cachedUser != null) {
                return cachedUser;
            }
        }

        UserDetails user = usuarioRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException(username));

        if (cache != null) {
            cache.put(username, user);
        }

        return user;
    }
}