package com.usermanager.manager.infra.mail;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import com.usermanager.manager.model.email.MailProvider;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MailService {
    
    @Value("${api.url:https://chamagol.com/api/auth/}")
    private String API_PREFIX;
    
    public final MailProvider mailProvider;
    
    public MailService(MailProvider mailProvider) {
        this.mailProvider = mailProvider;
    }
    
    /**
     * Envia email de verificação de conta com template HTML personalizado
     * @param recipient Email do destinatário
     * @param token Token de verificação
     */
    public void sendVerificationMail(String recipient, String token) {
        String subject = "ChamaGol - Confirme seu email";
        String verificationLink = API_PREFIX + "register/confirm?token=" + token;
        
        try {
            String htmlBody = loadEmailTemplate("verification_template.html");
            htmlBody = htmlBody.replace("{{VERIFICATION_LINK}}", verificationLink);
            htmlBody = htmlBody.replace("{{USER_EMAIL}}", recipient);
            
            mailProvider.sendEmail(recipient, subject, htmlBody);
        } catch (IOException e) {
            log.error("Erro ao carregar template verification_template.html: ", e);
            // Fallback para texto simples caso o template não seja encontrado
            String fallbackBody = "Olá! Bem-vindo ao ChamaGol!\n\n" +
                    "Para confirmar sua conta, clique no link abaixo:\n" +
                    verificationLink + "\n\n" +
                    "Este link expira em 24 horas.\n\n" +
                    "Equipe ChamaGol";
            
            mailProvider.sendEmail(recipient, subject, fallbackBody);
        }
    }
    
    /**
     * Envia email de redefinição de senha com template HTML personalizado
     * @param recipient Email do destinatário
     * @param token Token de redefinição
     */
    public void sendResetPasswordEmail(String recipient, String token) {
        String subject = "ChamaGol - Redefinir sua senha";
        String resetLink = API_PREFIX + "password/reset/confirmEmail?token=" + token;
        
        try {
            String htmlBody = loadEmailTemplate("reset_password_template.html");
            htmlBody = htmlBody.replace("{{RESET_LINK}}", resetLink);
            htmlBody = htmlBody.replace("{{USER_EMAIL}}", recipient);
            
            mailProvider.sendEmail(recipient, subject, htmlBody);
        } catch (IOException e) {
            log.error("Erro ao carregar template reset_password_template.html: ", e);
            // Fallback para texto simples caso o template não seja encontrado
            String fallbackBody = "Olá!\n\n" +
                    "Recebemos uma solicitação para redefinir a senha da sua conta ChamaGol.\n\n" +
                    "Para redefinir sua senha, clique no link abaixo:\n" +
                    resetLink + "\n\n" +
                    "Este link expira em 1 hora por questões de segurança.\n\n" +
                    "Se você não solicitou esta redefinição, pode ignorar este email.\n\n" +
                    "Equipe ChamaGol";
            
            mailProvider.sendEmail(recipient, subject, fallbackBody);
        }
    }
    
    /**
     * Carrega template de email do classpath com codificação UTF-8
     * @param templateName Nome do arquivo template
     * @return Conteúdo HTML do template
     * @throws IOException Se o arquivo não for encontrado
     */
    private String loadEmailTemplate(String templateName) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/email/" + templateName);
        
        try (InputStream inputStream = resource.getInputStream()) {
            // Garante leitura com UTF-8 para preservar emojis e caracteres especiais
            return StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
        }
    }
    
    /**
     * Método auxiliar para enviar emails com template personalizado
     * @param recipient Email do destinatário
     * @param subject Assunto do email
     * @param templateName Nome do template
     * @param replacements Mapa de substituições para o template
     */
    public void sendTemplatedEmail(String recipient, String subject, String templateName, 
                                 java.util.Map<String, String> replacements) {
        try {
            String htmlBody = loadEmailTemplate(templateName);
            
            // Substitui todos os placeholders no template
            for (java.util.Map.Entry<String, String> entry : replacements.entrySet()) {
                htmlBody = htmlBody.replace("{{" + entry.getKey() + "}}", entry.getValue());
            }
            
            mailProvider.sendEmail(recipient, subject, htmlBody);
        } catch (IOException e) {
            log.error("Erro ao carregar template de email: " + templateName, e);
            throw new RuntimeException("Erro ao carregar template de email: " + templateName, e);
        }
    }
}
