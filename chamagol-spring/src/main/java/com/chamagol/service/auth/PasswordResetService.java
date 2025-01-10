package com.chamagol.service.auth;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.chamagol.model.Usuario;
import com.chamagol.model.UsuarioResetPassword;
import com.chamagol.repository.UsuarioRepository;
import com.chamagol.repository.UsuarioResetTokenRepository;
import com.chamagol.service.user.UsuarioService;
import com.chamagol.service.util.ControleEmailService;
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
    private final ControleEmailService controleEmailService;


    public PasswordResetService(UsuarioRepository usuarioRepository,
            UsuarioResetTokenRepository usuarioResetTokenRepository, UsuarioService usuarioService,
            PasswordEncoder passwordEncoder, EmailService emailService, ControleEmailService controleEmailService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioResetTokenRepository = usuarioResetTokenRepository;
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.controleEmailService = controleEmailService;
    }

    @CacheEvict(value = "usuarioCache", key = "#email")
    @Transactional
    public boolean resetarSenhaEmail(String email) {
        if (Boolean.FALSE.equals(usuarioService.userExistsByEmail(email))) {
            return false;
        }

        Usuario user = (Usuario) usuarioRepository.findByEmail(email).orElseThrow();

        UsuarioResetPassword usuarioResetPassword = createUsuarioResetPassword(user);

        String token = usuarioResetPassword.getUuid().toString();
        String link = resetPasswordLink(token);

        usuarioResetTokenRepository.save(usuarioResetPassword);

        emailService.sendEmail(
            email,
            "Confirme email",
            emailService.buildPasswordResetEmail(formatName(user.getNome()), link)
        );
        controleEmailService.setControleEmail(user);
        return true;
    }

    @CacheEvict(value = "usuarioCache", key = "#email")
    @Transactional
    public boolean resetPassword(String email, String novaSenha) {
        Usuario user = usuarioRepository.findIdByEmail(email).orElseThrow(
            () -> new RuntimeException("usuário não encontrado.")
        );

        var usuarioResetPassword = usuarioResetTokenRepository.findByUsuarioId(user.getId()).orElseThrow(
            () -> new RuntimeException("não foi confirmado a troca de senha.")
        );

        if (usuarioResetPassword == null)
            return false;

        if (Boolean.FALSE.equals(usuarioResetPassword.getConfirmado())) {
            return false;
        }

        user = usuarioResetPassword.getUsuario();
        updateUserPassword(user, novaSenha);
        usuarioResetTokenRepository.delete(usuarioResetPassword);

        return true;
    }

    private UsuarioResetPassword createUsuarioResetPassword(Usuario usuario) {
        UsuarioResetPassword usuarioResetPassword = returnUsuarioResetPassword(usuario);

        usuarioResetPassword.setUsuario(usuario);
        usuarioResetPassword.setDataExpira(LocalDateTime.now().plusMinutes(20).toInstant(ZoneOffset.of("-03:00")));
        usuarioResetPassword.setUuid(UUID.randomUUID());
        usuarioResetPassword.setConfirmado(false);
        return usuarioResetPassword;
    }

    private UsuarioResetPassword returnUsuarioResetPassword(Usuario usuario) {
        return usuarioResetTokenRepository.findByUsuarioId(usuario.getId()).orElse(new UsuarioResetPassword());
    }

    private String resetPasswordLink(String token) {
        return apiUrl + "/auth/password/reset/confirmEmail?token=" + token;
    }

    private void updateUserPassword(Usuario user, String novaSenha) {
        user.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(user);
    }

    private String formatName(String nome) {
        String[] nomes = nome.split(" ");
        return StringUtils.capitalize(nomes[0]);
    }

}
