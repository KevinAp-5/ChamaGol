package com.usermanager.manager.enums;

public enum Subscription {
    FREE("FREE"),
    VIP("VIP");

    Subscription(String value) {
        this.value = value;
    }

    private String value;

    public String getValue() {
        return this.value;
    }
}
