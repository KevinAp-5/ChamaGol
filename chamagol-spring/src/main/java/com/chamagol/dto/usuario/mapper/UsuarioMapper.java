package com.chamagol.dto.usuario.mapper;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.enums.Assinatura;
import com.chamagol.enums.Status;
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

     public static Usuario mapFromHashMap(Map<String, Object> map) {
        if (map == null) {
            return null;
        }

        Usuario usuario = new Usuario();

        usuario.setId(Long.valueOf((int) map.get("_id")));
        usuario.setNome((String) map.get("nome"));
        usuario.setEmail((String) map.get("email"));
        usuario.setSenha((String) map.get("senha"));
        usuario.setStatus(Status.valueOf(map.get("status").toString()));
        usuario.setAssinatura(Assinatura.valueOf(map.get("assinatura").toString()));

        // Converter authorities
        @SuppressWarnings("unchecked")
        List<Map<String, String>> authoritiesMap = (List<Map<String, String>>) map.get("authorities");
        if (authoritiesMap != null) {
            List<SimpleGrantedAuthority> authorities = authoritiesMap.stream()
                .map(auth -> new SimpleGrantedAuthority(auth.get("authority")))
                .collect(Collectors.toList());

            usuario.setAuthorities(authorities);
        }

        return usuario;
    }

}
