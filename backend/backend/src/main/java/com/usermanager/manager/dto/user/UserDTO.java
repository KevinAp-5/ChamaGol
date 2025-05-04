package com.usermanager.manager.dto.user;

import com.usermanager.manager.model.user.UserRole;

import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserDTO(
    Long id,

    @NotBlank(message = "Name can not be blank")
    String name, 

    @NotBlank(message = "Login can not be blank")
    @Email
    String login, 

    @NotBlank(message = "Password can not be blank")
    String password,

    @Enumerated
    UserRole role) {
}
