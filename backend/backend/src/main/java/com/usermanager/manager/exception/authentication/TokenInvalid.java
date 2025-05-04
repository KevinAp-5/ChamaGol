package com.usermanager.manager.exception.authentication;

public class TokenInvalid extends RuntimeException{
    public TokenInvalid(String message) {
        super(message);
    }

}
