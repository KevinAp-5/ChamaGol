package com.chamagol.dto;

import com.chamagol.enums.Assinatura;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioAutenticacao(

    @JsonProperty("id")
    Long id,

    @NotBlank
    String nome,

    @Email
    @NotBlank
    String email,

    @NotBlank
    String senha,

    @Enumerated
    Assinatura assinatura
) {

}
