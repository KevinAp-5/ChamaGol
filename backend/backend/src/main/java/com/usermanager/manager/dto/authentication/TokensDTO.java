package com.usermanager.manager.dto.authentication;

import jakarta.validation.constraints.NotBlank;

public record TokensDTO(@NotBlank String accessToken, @NotBlank String refreshToken) {

}
