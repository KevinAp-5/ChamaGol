package com.chamagol.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioUpdate(
    @NotNull
    Long id,

    @NotBlank
    String nome,

    @NotBlank
    @Email
    String email) {

}
