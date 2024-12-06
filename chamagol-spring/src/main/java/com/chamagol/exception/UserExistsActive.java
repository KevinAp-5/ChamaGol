package com.chamagol.exception;

public class UserExistsActive extends RuntimeException{
    public UserExistsActive(String msg, Throwable cause) {
        super(msg, cause);
    }

    public UserExistsActive(String msg) {
        super(msg);
    }
}
