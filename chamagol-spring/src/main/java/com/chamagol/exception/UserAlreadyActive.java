package com.chamagol.exception;

public class UserAlreadyActive extends RuntimeException{
    public UserAlreadyActive(String msg, Throwable cause) {
        super(msg, cause);
    }

    public UserAlreadyActive(String msg) {
        super(msg);
    }
}
