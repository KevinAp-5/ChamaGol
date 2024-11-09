package com.chamagol.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamagol.exception.TokenInvalid;
import com.chamagol.model.Usuario;
import com.chamagol.repository.UsuarioRepository;


@Service
public class PasswordResetService {
    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private EmailService emailService;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    @Autowired
    public void setUsuarioRepository(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Autowired
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }


    @Transactional
    public boolean resetarSenhaEmail(String email) {
        Usuario user = (Usuario) usuarioRepository.findByEmail(email).orElseThrow(
            () -> new UsernameNotFoundException("Usuário não encontrado" + email)
        );

        String token = UUID.randomUUID().toString();
        String link = resetPasswordLink(token);

        user.setResetToken(token);
        usuarioRepository.save(user);

        emailService.sendEmail(
            email,
            "Cadastre uma nova senha",
            "Acesse o link abaixo para cadastrar uma nova senha: \n" + link
        );

        return true;
    }

    private String resetPasswordLink(String token) {
        return "http://localhost:8080/api/auth/reset-password/confirm?token=" + token;
    }

    @Transactional
    public boolean resetPassword(String token, String novaSenha) {
        Usuario user = (Usuario) usuarioRepository.findByResetToken(token).orElseThrow(
            () -> new TokenInvalid("Token de resetar senha inválido")
        );

        if (user == null) {
            return false;
        }

        user.setSenha(passwordEncoder.encode(novaSenha));
        user.setResetToken(null);
        usuarioRepository.save(user);
        return true;
    }

}
