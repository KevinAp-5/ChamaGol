package com.usermanager.manager.enums;

public enum Status {
    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE"),
    PENDING("PENDING"),
    BLOCKED("BLOCKED"),
    DELETED("DELETED");

    Status(String value) {
        this.value = value;
    }

    private String value;

    public String getValue() {
        return value;
    }

}
