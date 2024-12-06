package com.chamagol.dto.token;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record TokenDTO(@NotBlank @NotNull String token, @NotBlank @NotNull String refreshToken) {
}
