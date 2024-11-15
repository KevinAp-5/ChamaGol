package com.chamagol.exception;

public class IDNotFoundException extends RuntimeException{
    public IDNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public IDNotFoundException(String message) {
        super(message);
    }
}
