package com.usermanager.manager.dto.authentication;

import jakarta.validation.constraints.NotBlank;

public record AccessTokenDTO(@NotBlank String token) {

}
