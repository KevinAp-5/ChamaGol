package com.chamagol.exception;

public class TokenInvalid extends RuntimeException{
    public TokenInvalid(String message, Throwable cause) {
        super(message, cause);
    }

    public TokenInvalid(String message) {
        super(message);
    }
}
