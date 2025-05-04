package com.usermanager.manager.model.verification.enums;

public enum TokenType {

    EMAIL_VALIDATION("emailValidation"),
    RESET_PASSWORD("resetPassword");

    private String value;

    private TokenType(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }

    @Override
    public String toString() {
        return this.value;
    }
}
