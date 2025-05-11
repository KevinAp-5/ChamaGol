package com.usermanager.manager.enums;

public enum ClientType {
    WEB("WEB"),
    MOBILE("MOBILE");

    private String value;

    ClientType(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }
}
