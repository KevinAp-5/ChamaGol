package com.chamagol.exception;

public class EmailNotConfirmed extends RuntimeException{

    public EmailNotConfirmed(String msg, Throwable ex) {
        super(msg, ex);
    }

    public EmailNotConfirmed(String msg) {
        super(msg);
    }
}
