package com.usermanager.manager.exception.authentication;

public class JWTException extends RuntimeException{
    public JWTException(String message) {
        super(message);
    }
}
