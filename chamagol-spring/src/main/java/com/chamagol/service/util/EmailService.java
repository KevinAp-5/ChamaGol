package com.chamagol.service.util;

import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
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
    public CompletableFuture<Void> sendEmail(String destinatario, String assunto, String texto) {
        MimeMessagePreparator messagePreparator = mimeMessage -> {
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage);
            messageHelper.setTo(destinatario);
            messageHelper.setFrom(remetente);
            messageHelper.setSubject(assunto);
            messageHelper.setText(texto, true);
        };

        return CompletableFuture.runAsync(() -> {
            try {
                javaMailSender.send(messagePreparator);
            }
            catch (Exception exception) {
                throw new EmailSendingError(exception.getMessage(), exception.getCause());
            }
        });
    }

    public String buildEmail(String nome, String link) {
        return "<div style=\"font-family:Helvetica,Arial,sans-serif;font-size:16px;margin:0;color:#0b0c0c\">\n" +
                "<span style=\"display:none;font-size:1px;color:#fff;max-height:0\"></span>\n" +
                "<table role=\"presentation\" width=\"100%\" style=\"border-collapse:collapse;min-width:100%;width:100%!important\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
                "  <tbody><tr>\n" +
                "    <td width=\"100%\" height=\"70\" bgcolor=\"#6D9773\" style=\"text-align:center;color:#ffffff;\">\n" +
                "      <h1 style=\"font-size:24px;margin:0;font-weight:700;line-height:70px;\">Bem-vindo ao ChamaGol</h1>\n" +
                "    </td>\n" +
                "  </tr></tbody>\n" +
                "</table>\n" +
                "<table role=\"presentation\" class=\"content\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;max-width:600px;width:100%!important;background-color:#ffffff;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,0.1);\">\n" +
                "  <tbody><tr>\n" +
                "    <td style=\"padding:20px;text-align:left;\">\n" +
                "      <p style=\"margin:0 0 20px 0;font-size:18px;color:#333333;\">Olá <strong>" + nome + "</strong>,</p>\n" +
                "      <p style=\"margin:0 0 20px 0;font-size:16px;color:#333333;\">Bem-vindo ao <strong>ChamaGol</strong>, o melhor lugar para acompanhar as dicas de futebol!</p>\n" +
                "      <p style=\"margin:0 0 20px 0;font-size:16px;color:#333333;\">Por favor, clique no botão abaixo para ativar sua conta e começar a aproveitar os benefícios:</p>\n" +
                "      <div style=\"text-align:center;margin:20px 0;\">\n" +
                "        <a href=\"" + link + "\" style=\"background-color:#6D9773;color:#ffffff;padding:10px 20px;text-decoration:none;font-size:16px;border-radius:5px;display:inline-block;\">Ativar Minha Conta</a>\n" +
                "      </div>\n" +
                "      <p style=\"margin:0 0 20px 0;font-size:14px;color:#555555;\">Este link expirará em 15 minutos. Se você não realizou esta solicitação, ignore este e-mail.</p>\n" +
                "    </td>\n" +
                "  </tr></tbody>\n" +
                "</table>\n" +
                "<table role=\"presentation\" width=\"100%\" style=\"border-collapse:collapse;min-width:100%;width:100%!important;margin-top:20px;\">\n" +
                "  <tbody><tr>\n" +
                "    <td style=\"text-align:center;padding:10px 0;color:#6D9773;font-size:12px;\">\n" +
                "      <p style=\"margin:0;\">© 2024 ChamaGol. Todos os direitos reservados.</p>\n" +
                "    </td>\n" +
                "  </tr></tbody>\n" +
                "</table>\n" +
                "</div>";
    } 
}
