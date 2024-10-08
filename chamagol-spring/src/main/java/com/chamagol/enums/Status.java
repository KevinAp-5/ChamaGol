package com.chamagol.enums;

public enum Status {
    ACTIVE("Active"),
    INACTIVE("Inactive");

    private String value;
    private Status(String status ) {
        this.value = status;
    }    

   public String getValue() {
        return this.value;
   }

   @Override
   public String toString() {
        return this.getValue();
   }
}
