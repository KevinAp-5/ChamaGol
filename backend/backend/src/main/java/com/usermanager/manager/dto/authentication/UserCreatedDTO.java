package com.usermanager.manager.dto.authentication;

import com.usermanager.manager.model.user.User;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserCreatedDTO(
    @NotNull Long id,
    @NotBlank String name,
    @NotBlank String login,
    @NotNull Boolean emailVerified
) {
    public UserCreatedDTO(User user) {
        this(
            user.getId(),
            user.getName(),
            user.getLogin(),
            user.getEnabled()
        );
    }
}
