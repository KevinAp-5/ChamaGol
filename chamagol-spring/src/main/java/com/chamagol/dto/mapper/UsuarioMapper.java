package com.chamagol.dto.mapper;

import org.springframework.stereotype.Component;

import com.chamagol.dto.UsuarioDTO;
import com.chamagol.model.Usuario;

@Component
public class UsuarioMapper {

    public Usuario toEntity(UsuarioDTO usuarioDTO) {
        if (usuarioDTO == null) {
            return null;
        }

        Usuario usuario = new Usuario();
        if (usuarioDTO.id() != null) {
            usuario.setId(usuarioDTO.id());
        }

        usuario.setNome(usuarioDTO.nome());
        usuario.setEmail(usuarioDTO.email());
        usuario.setSenha(usuarioDTO.senha());
        usuario.setAssinatura(usuarioDTO.assinatura());

        return usuario;
    }

    public UsuarioDTO toDTO(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        return new UsuarioDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getSenha(),
            usuario.getAssinatura(),
            usuario.getStatus()
        );
    }
}
