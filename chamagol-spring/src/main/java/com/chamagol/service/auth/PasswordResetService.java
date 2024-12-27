package com.chamagol.service.auth;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.chamagol.exception.TokenInvalid;
import com.chamagol.model.Usuario;
import com.chamagol.model.UsuarioResetPassword;
import com.chamagol.repository.UsuarioRepository;
import com.chamagol.repository.UsuarioResetTokenRepository;
import com.chamagol.service.user.UsuarioService;
import com.chamagol.service.util.EmailService;


@Service
public class PasswordResetService {
    @Value("${api.url.prefix}")
    private String apiUrl;

    private final UsuarioRepository usuarioRepository;
    private final UsuarioResetTokenRepository usuarioResetTokenRepository;    
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;


    public PasswordResetService(UsuarioRepository usuarioRepository,
            UsuarioResetTokenRepository usuarioResetTokenRepository, UsuarioService usuarioService,
            PasswordEncoder passwordEncoder, EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioResetTokenRepository = usuarioResetTokenRepository;
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @CacheEvict(value = "usuario", key = "#email")
    @Transactional
    public boolean resetarSenhaEmail(String email) {
        Usuario user = (Usuario) usuarioService.getUsuario(email);

        UsuarioResetPassword usuarioResetPassword = createUsuarioResetPassword(user);

        String token = usuarioResetPassword.getUuid().toString();
        String link = resetPasswordLink(token);

        usuarioResetTokenRepository.save(usuarioResetPassword);

        emailService.sendEmail(
            email,
            "Confirme email",
            emailService.buildPasswordResetEmail(formatName(user.getNome()), link)
        );

        return true;
    }

    @CacheEvict(value = "usuario", key = "#email")
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
        return usuarioResetTokenRepository.findByUsuarioId(usuario.getId()).orElse(new UsuarioResetPassword());
    }

    private String resetPasswordLink(String token) {
        return apiUrl + "/auth/password/reset/confirmEmail?token=" + token;
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

    private String formatName(String nome) {
        String[] nomes = nome.split(" ");
        return StringUtils.capitalize(nomes[0]);
    }

}
