package com.chamagol.dto.token;

import jakarta.validation.constraints.NotBlank;
public record TokenDTO(@NotBlank String token) {
}
