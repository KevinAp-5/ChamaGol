package com.chamagol.service.user;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.chamagol.repository.UsuarioRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService{
    private UsuarioRepository usuarioRepository;

    public UserDetailsServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return usuarioRepository.findByEmail(username).orElseThrow(
            () -> new UsernameNotFoundException("Usuário não encontrado")
        );
    }
}
