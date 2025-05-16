package com.usermanager.manager.model.webhook.enums;

public enum EventStatus {
    PENDING("PENDING"),
    PROCESSED("PROCESSED"),
    ERROR("ERROR");

    private String value;

    EventStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }
}
