package com.chamagol.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


@Service
public class EmailService{

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    @Async
    public void sendEmail(String destinatario, String assunto, String texto) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(remetente);
            mailMessage.setTo(destinatario);
            mailMessage.setSubject(assunto);
            mailMessage.setText(texto);

            javaMailSender.send(mailMessage);

        }
        catch (Exception exception) {
            throw new RuntimeException(
                "Erro ao enviar e-mail: " + exception.getLocalizedMessage(),
                exception.getCause()
            );
        }
    }

}
