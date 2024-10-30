package com.chamagol.dto.util;

import jakarta.validation.constraints.Email;

public record ResetPasswordBody(
    @Email
    String email
) {

}