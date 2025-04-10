package com.chamagol.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioAutenticacao(@Email String email, @NotBlank String senha) {

}
