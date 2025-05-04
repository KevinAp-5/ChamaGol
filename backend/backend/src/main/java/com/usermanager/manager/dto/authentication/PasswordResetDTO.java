package com.usermanager.manager.dto.authentication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetDTO(
    @NotBlank
    @Size(max = 128, message = "Password can not have more than 128 characters")
    @Size(min = 8, message = "Password too short. Minimum length is 8 characters")
    String newPassword) {

}
