package com.chamagol.dto.token;

import jakarta.validation.constraints.NotBlank;

public record AccessToken(@NotBlank @NotBlank String token) {

}
