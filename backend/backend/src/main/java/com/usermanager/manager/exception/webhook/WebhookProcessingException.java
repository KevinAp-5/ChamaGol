package com.usermanager.manager.exception.webhook;

public class WebhookProcessingException extends Exception {
    private static final long serialVersionUID = 1L;

    public WebhookProcessingException(String message) {
        super(message);
    }

    public WebhookProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}