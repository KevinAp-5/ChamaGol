package com.chamagol.service.user;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

import org.redisson.api.RMapCache;
import org.redisson.api.RedissonClient;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.chamagol.repository.UsuarioRepository;

@Service
@Primary
public class UsuarioCacheService {

    private final UsuarioRepository usuarioRepository;
    private final RMapCache<String, UserDetails> usuarioCache;

    public UsuarioCacheService(UsuarioRepository usuarioRepository, RedissonClient redissonClient) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioCache = redissonClient.getMapCache("usuarioCache");
    }

    public UserDetails getUsuarioFromCache(String email) {
        return usuarioCache.computeIfAbsent(email, Duration.ofMinutes(20), k -> getUsuario(email)); // Tempo de vida no cache
    }

    public void evictUsuario(String email) {
        usuarioCache.remove(email);
    }

    public void atualizarUsuario(String email, UserDetails userDetails) {
        usuarioCache.put(email, userDetails, 20, TimeUnit.MINUTES);
    }

    private UserDetails getUsuario(String email) {
        return usuarioRepository.findByEmail(email).orElseThrow(
            () -> new UsernameNotFoundException(email)
        );
    }
}
