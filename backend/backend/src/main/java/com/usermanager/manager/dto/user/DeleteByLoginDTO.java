package com.usermanager.manager.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DeleteByLoginDTO(@Email @NotBlank String email) {

}
