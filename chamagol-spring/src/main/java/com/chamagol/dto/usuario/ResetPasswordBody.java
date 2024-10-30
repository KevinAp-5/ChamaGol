package com.chamagol.dto.usuario;

import jakarta.validation.constraints.Email;

public record ResetPasswordBody(
    @Email
    String email
) {

}