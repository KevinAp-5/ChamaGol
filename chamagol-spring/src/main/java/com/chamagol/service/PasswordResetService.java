package com.chamagol.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamagol.exception.TokenInvalid;
import com.chamagol.model.Usuario;
import com.chamagol.model.UsuarioResetPassword;
import com.chamagol.repository.UsuarioRepository;
import com.chamagol.repository.UsuarioResetTokenRepository;


@Service
public class PasswordResetService {
    private UsuarioRepository usuarioRepository;
    private UsuarioResetTokenRepository usuarioResetTokenRepository;    
    private PasswordEncoder passwordEncoder;
    private EmailService emailService;

    @Autowired
    public void setUsuarioResetTokenRepository(UsuarioResetTokenRepository usuarioResetTokenRepository) {
        this.usuarioResetTokenRepository = usuarioResetTokenRepository;
    }
    
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
            () -> new UsernameNotFoundException("" + email)
        );

        UsuarioResetPassword usuarioResetPassword = createUsuarioResetPassword(user);

        String token = usuarioResetPassword.getUuid().toString();
        String link = resetPasswordLink(token);

        usuarioResetTokenRepository.save(usuarioResetPassword);

        emailService.sendEmail(
            email,
            "Cadastre uma nova senha",
            "Acesse o link abaixo para cadastrar uma nova senha: \n" + link
        );

        return true;
    }

    @Transactional
    public boolean resetPassword(String token, String novaSenha) {
        UsuarioResetPassword usuarioResetPassword = usuarioResetTokenRepository.findByUuid(UUID.fromString(token)).orElseThrow(
            () -> new TokenInvalid("Token inválido ou expirado.")
        );

        if (usuarioResetPassword == null)
            return false;

        if (!tokenIsValid(usuarioResetPassword))
            return false;

        Usuario user = usuarioResetPassword.getUsuario();
        updateUserPassword(user, novaSenha);
        usuarioResetTokenInvalidator(usuarioResetPassword);

        return true;
    }

    private UsuarioResetPassword createUsuarioResetPassword(Usuario usuario) {
        UsuarioResetPassword usuarioResetPassword = returnUsuarioResetPassword(usuario);

        usuarioResetPassword.setUsuario(usuario);
        usuarioResetPassword.setDataExpira(LocalDateTime.now().plusMinutes(20).toInstant(ZoneOffset.of("-03:00")));
        usuarioResetPassword.setUuid(UUID.randomUUID());
        return usuarioResetPassword;
    }

    private UsuarioResetPassword returnUsuarioResetPassword(Usuario usuario) {
        Boolean user = usuarioResetTokenRepository.findByUsuarioId(usuario.getId()).isPresent();

        if (Boolean.TRUE.equals(user)) {
            return usuarioResetTokenRepository.findByUsuarioId(usuario.getId()).orElseThrow(
                () -> new UsernameNotFoundException("" + usuario)
            );
        }

        return new UsuarioResetPassword();
    }

    private String resetPasswordLink(String token) {
        return "http://localhost:8080/api/auth/password/reset/confirm?token=" + token;
    }

    private boolean tokenIsValid(UsuarioResetPassword user) {
        return !user.getDataExpira().isBefore(Instant.now());
    }

    private void updateUserPassword(Usuario user, String novaSenha) {
        user.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(user);
    }

    private void usuarioResetTokenInvalidator(UsuarioResetPassword user) {
        user.setDataExpira(Instant.now());
        usuarioResetTokenRepository.save(user);
    }
}
