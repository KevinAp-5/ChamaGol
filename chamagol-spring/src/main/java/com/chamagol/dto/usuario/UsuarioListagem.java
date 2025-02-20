package com.chamagol.dto.usuario;

import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;

import com.chamagol.enums.Assinatura;
import com.chamagol.model.Usuario;

import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
public record UsuarioListagem(
    @NotNull
    Long id,

    @NotBlank
    String nome,

    @NotBlank
    @Email
    String email,

    @Enumerated
    Assinatura assinatura
) {
    
    public UsuarioListagem(Usuario usuario ) {
        this(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getAssinatura()
        );
    }
}
