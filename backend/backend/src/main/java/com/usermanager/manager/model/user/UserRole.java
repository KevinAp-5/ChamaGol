package com.usermanager.manager.model.user;

public enum UserRole {
    ADMIN("admin"),
    USER("admin");

    private String role;

    UserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return this.role;
    }
}
