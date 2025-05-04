package com.usermanager.manager.exception.authentication;

public class PasswordFormatNotValidException extends RuntimeException{
    public PasswordFormatNotValidException(String message) {
        super(message);
    }
}
