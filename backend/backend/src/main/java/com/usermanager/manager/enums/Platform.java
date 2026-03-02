package com.usermanager.manager.enums;

public enum Platform {
    ANDROID("ANDROID"),
    IOS("IOS");

    private String value;

    Platform(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }
}
