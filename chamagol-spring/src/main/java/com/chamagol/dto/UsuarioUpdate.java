package com.chamagol.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioUpdate(
    @NotNull
    Long id,

    @NotBlank
    String nome,

    @NotBlank
    String email) {

}
