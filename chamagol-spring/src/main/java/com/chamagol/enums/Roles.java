package com.chamagol.enums;

public enum Roles {
    USER("user"),
    MESTRE("mestre"),
    ADMIN("admin");

    private String role;

    Roles(String role) {
        this.role = role;
    }

    public String getRole() {
        return this.role;
    }
}
