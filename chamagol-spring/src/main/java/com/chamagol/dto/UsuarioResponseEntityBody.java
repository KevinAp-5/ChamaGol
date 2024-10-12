package com.chamagol.dto;

import com.chamagol.enums.Status;
import com.chamagol.model.Usuario;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;

import com.chamagol.enums.Assinatura;

public record UsuarioResponseEntityBody(

    @JsonProperty("id")
    Long id,

    @NotBlank
    String nome,

    @NotBlank
    String Email,

    @NotBlank
    String senha,

    @Enumerated
    Assinatura assinatura,

    @Enumerated
    Status status

) {

    public UsuarioResponseEntityBody(Usuario usuario) {
        this(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getSenha(),
            usuario.getAssinatura(),
            usuario.getStatus()
        );
    }
}
