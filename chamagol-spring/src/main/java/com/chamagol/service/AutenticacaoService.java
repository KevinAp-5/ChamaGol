package com.chamagol.service;

import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.chamagol.model.Usuario;
import com.chamagol.repository.UsuarioRepository;

@Service
public class AutenticacaoService implements UserDetailsService {

    private UsuarioRepository usuarioRepository;

    public AutenticacaoService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        var user = usuarioRepository.findByEmail(username);
        return userMappingUserDetails(user);
    }

    private UserDetails userMappingUserDetails(Usuario usuario) {
        GrantedAuthority userRole = new SimpleGrantedAuthority("ROLE_USER");

        return new User(
                usuario.getNome(),
                usuario.getSenha(),
                true,
                true,
                true,
                true,
                Collections.singletonList(userRole));
    }

}
