package com.chamagol.exception;

public class EmailSendingError extends RuntimeException{
    public EmailSendingError(String message, Throwable cause) {
        super(message, cause);
    }

    public EmailSendingError(String msg) {
        super(msg);
    }
}
