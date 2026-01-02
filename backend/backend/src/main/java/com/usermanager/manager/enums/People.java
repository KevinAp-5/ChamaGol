package com.usermanager.manager.enums;

public enum People {
    ALL("ALL"),
    VIP("VIP"),
    FREE("FREE");

    private String value;

    People(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }
}
