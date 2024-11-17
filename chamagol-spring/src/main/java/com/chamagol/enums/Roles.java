package com.chamagol.enums;

public enum Roles {
    USER("USER"),
    MESTRE("MESTRE"),
    ADMIN("ADMIN");

    private String role;

    Roles(String role) {
        this.role = role;
    }

    public String getRole() {
        return this.role;
    }
}
