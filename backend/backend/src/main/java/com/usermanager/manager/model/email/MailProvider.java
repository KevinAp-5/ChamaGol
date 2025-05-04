package com.usermanager.manager.model.email;

import java.util.concurrent.CompletableFuture;

public interface MailProvider {
    CompletableFuture<Void> sendEmail(String recipient, String subject, String content);
}
