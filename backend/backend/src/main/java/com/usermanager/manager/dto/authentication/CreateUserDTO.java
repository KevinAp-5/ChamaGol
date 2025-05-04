package com.usermanager.manager.dto.authentication;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserDTO(
        @NotBlank String name,

        @NotBlank @Email String login,

        @NotBlank @Size(min = 6) @Size(max = 128) String password) {

}
