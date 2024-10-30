package com.chamagol.dto.usuario;

import jakarta.validation.constraints.NotBlank;

public record ConfirmPasswordBody(@NotBlank String novaSenha) {}