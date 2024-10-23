package com.chamagol.exception;

public class TokenCreationException extends RuntimeException{
    public TokenCreationException(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }
}
