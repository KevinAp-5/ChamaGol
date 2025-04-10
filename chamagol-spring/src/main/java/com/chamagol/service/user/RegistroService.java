package com.chamagol.service.user;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.usuario.mapper.UsuarioMapper;
import com.chamagol.dto.util.ApiResponse;
import com.chamagol.enums.Status;
import com.chamagol.exception.UserExistsActive;
import com.chamagol.infra.EmailValidator;
import com.chamagol.model.Usuario;
import com.chamagol.model.UsuarioResetPassword;
import com.chamagol.model.UsuarioVerificadorEntity;
import com.chamagol.repository.UsuarioRepository;
import com.chamagol.repository.UsuarioResetTokenRepository;
import com.chamagol.repository.UsuarioVerificadorRepository;
import com.chamagol.service.util.ControleEmailService;
import com.chamagol.service.util.EmailService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@Service
public class RegistroService {
    @Value("${api.url.prefix}")
    private String apiUrl;

    private final UsuarioVerificadorRepository usuarioVerificadorRepository;
    private final UsuarioResetTokenRepository usuarioResetTokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ControleEmailService controleEmailService;

    public RegistroService(UsuarioVerificadorRepository usuarioVerificadorRepository,
            UsuarioResetTokenRepository usuarioResetTokenRepository, UsuarioRepository usuarioRepository,
            UsuarioMapper usuarioMapper, PasswordEncoder passwordEncoder, EmailService emailService,
            EmailValidator emailValidator, ControleEmailService controleEmailService) {
        this.usuarioVerificadorRepository = usuarioVerificadorRepository;
        this.usuarioResetTokenRepository = usuarioResetTokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.controleEmailService = controleEmailService;
    }

    @Transactional
    @CacheEvict(value = "usuarioCache", allEntries = true)
    public boolean confirmUser(UUID uuid) {
        UsuarioVerificadorEntity userVerificador = usuarioVerificadorRepository.findByUuid(uuid)
                .orElseThrow(
                        () -> new UsernameNotFoundException("Token não encontrado!"));

        if (userVerificador.getUsuario().getStatus() == Status.ACTIVE) {
            throw new IllegalStateException("Email já foi confirmado!");
        }

        boolean validDate = userVerificador.getDataExpira().compareTo(Instant.now()) >= 0;
        if (!validDate) {
            usuarioVerificadorRepository.delete(userVerificador);
            throw new IllegalStateException("Expirado tempo de validação");
        }

        Usuario user = userVerificador.getUsuario();
        user.activateUsuario();
        usuarioRepository.save(user);

        return true;
    }

    @Transactional
    public boolean confirmarResetPassword(String uuid) {
        UsuarioResetPassword user = usuarioResetTokenRepository.findByUuid(UUID.fromString(uuid)).orElse(null);

        if (user == null) {
            return false;
        }

        if (user.getDataExpira().compareTo(Instant.now()) >= 0) {
            user.setConfirmado(true);
            return true;
        }

        return false;
    }

    @Transactional
    public ApiResponse<UsuarioListagem> createUser(@Valid @NotNull UsuarioDTO usuarioDTO) {
        if (isEmailAlreadyRegistered(usuarioDTO.email())) {
            resendLink(usuarioDTO.email());
            return new ApiResponse<>(null, "Email de validação enviado.");
        }

        Usuario usuario = saveUsuario(usuarioDTO);

        UsuarioVerificadorEntity usuarioVerificador = createUsuarioVerificador(usuario);

        sendConfirmationEmail(usuario, usuarioVerificador);

        return new ApiResponse<>(new UsuarioListagem(usuario), "Usuario criado com sucesso.");
    }

    private void resendLink(String email) {
        Usuario usuario = (Usuario) usuarioRepository.findByEmail(email).orElseThrow(
                () -> new UsernameNotFoundException(email));

        if (usuario.getStatus() == Status.ACTIVE) {
            throw new UserExistsActive(email);
        }

        UsuarioVerificadorEntity verificador = usuarioVerificadorRepository.findByUsuarioId(usuario.getId())
                .orElseThrow();
        updateVerificador(verificador);

        sendConfirmationEmail(usuario, verificador);
    }

    private void updateVerificador(UsuarioVerificadorEntity verificador) {
        verificador.setUuid(UUID.randomUUID());
        verificador.setDataExpira(Instant.now().plus(60, ChronoUnit.MINUTES));
        usuarioVerificadorRepository.save(verificador);
    }

    private Usuario saveUsuario(UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioMapper.toEntity(usuarioDTO);
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }

    private UsuarioVerificadorEntity createUsuarioVerificador(Usuario usuario) {
        UsuarioVerificadorEntity usuarioVerificador = new UsuarioVerificadorEntity();
        usuarioVerificador.setUsuario(usuario);
        usuarioVerificador.setUuid(UUID.randomUUID());
        usuarioVerificador.setDataExpira(Instant.now().plus(15, ChronoUnit.MINUTES));
        return usuarioVerificadorRepository.save(usuarioVerificador);
    }

    private void sendConfirmationEmail(Usuario usuario, UsuarioVerificadorEntity usuarioVerificador) {
        String emailBody = emailService.buildEmail(
                emailService.formatName(usuario.getNome()),
                emailService.confirmEmailLink(usuarioVerificador.getUuid()));
        emailService.sendEmail(usuario.getEmail(), "ChamaGol", emailBody);
        controleEmailService.setControleEmail(usuario);
    }

    private boolean isEmailAlreadyRegistered(String email) {
        return usuarioRepository.existsByEmail(email);
    }
}
