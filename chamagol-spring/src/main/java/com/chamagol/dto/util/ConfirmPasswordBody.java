package com.chamagol.dto.util;

import jakarta.validation.constraints.NotBlank;

public record ConfirmPasswordBody(@NotBlank String novaSenha) {}