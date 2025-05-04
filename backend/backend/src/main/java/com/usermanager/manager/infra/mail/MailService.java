package com.usermanager.manager.infra.mail;

import org.springframework.stereotype.Service;

import com.usermanager.manager.model.email.MailProvider;

@Service
public class MailService {
    private static final String API_PREFIX = "https://furia-challenge1.onrender.com/api/auth/";
    public final MailProvider mailProvider;

    public MailService(MailProvider mailProvider) {
        this.mailProvider = mailProvider;
    }

    public void sendVerificationMail(String recipient, String token ) {
        String subject = "Verify your e-mail";
        String body = "Click here to activate your account: " + API_PREFIX + "register/confirm?token=" + token;
        mailProvider.sendEmail(recipient, subject, body);
    }

    public void sendResetPasswordEmail(String recipient, String token) {
        String subject = "Verify your e-mail";
        String body = "Click here to reset your password: " + API_PREFIX + "password/reset/confirmEmail?token=" + token;
        mailProvider.sendEmail(recipient, subject, body);

    }
}
