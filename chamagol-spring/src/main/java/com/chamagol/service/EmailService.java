package com.chamagol.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.chamagol.exception.EmailSendingError;


@Service
public class EmailService{

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Async
    public void sendEmail(String destinatario, String assunto, String texto) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom(remetente);
        mailMessage.setTo(destinatario);
        mailMessage.setSubject(assunto);
        mailMessage.setText(texto);

        try {
            javaMailSender.send(mailMessage);
        }
        catch (Exception exception) {
            throw new EmailSendingError(
                "Erro ao enviar e-mail: " + exception.getLocalizedMessage(),
                exception.getCause()
            );
        }
    }

}
