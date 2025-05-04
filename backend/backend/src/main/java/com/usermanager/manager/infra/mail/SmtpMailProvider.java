package com.usermanager.manager.infra.mail;

import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.usermanager.manager.model.email.MailProvider;

@Service
public class SmtpMailProvider implements MailProvider{

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    public SmtpMailProvider(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Async
    @Override
    public CompletableFuture<Void> sendEmail(String recipient, String subject, String content) {
        MimeMessagePreparator messagePreparator = mimeMessage -> {
            var messageHelper = new MimeMessageHelper(mimeMessage);
            messageHelper.setTo(recipient);
            messageHelper.setFrom(sender);
            messageHelper.setSubject(subject);
            messageHelper.setText(content, true);
        };

        return CompletableFuture.runAsync(() -> {
            try {
                javaMailSender.send(messagePreparator);
            } catch (Exception e) {
                throw new MailSendException(e.getMessage());
            }
        });
    }
}
