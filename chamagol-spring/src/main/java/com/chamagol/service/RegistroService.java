package com.chamagol.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioResponseEntityBody;
import com.chamagol.dto.usuario.mapper.UsuarioMapper;
import com.chamagol.dto.util.ApiResponse;
import com.chamagol.dto.util.MensagemResponse;
import com.chamagol.enums.Status;
import com.chamagol.infra.EmailValidator;
import com.chamagol.model.Usuario;
import com.chamagol.model.UsuarioVerificadorEntity;
import com.chamagol.repository.UsuarioRepository;
import com.chamagol.repository.UsuarioVerificadorRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@Service
public class RegistroService {
    private final UsuarioVerificadorRepository usuarioVerificadorRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final EmailValidator emailValidator;

    public RegistroService(UsuarioVerificadorRepository usuarioVerificadorRepository,
            UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper, PasswordEncoder passwordEncoder,
            EmailService emailService, EmailValidator emailValidator) {
        this.usuarioVerificadorRepository = usuarioVerificadorRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.emailValidator = emailValidator;
    }

    @Transactional
    public ResponseEntity<String> confirmUser(UUID uuid) {
        UsuarioVerificadorEntity userVerificador = usuarioVerificadorRepository.findByUuid(uuid)
        .orElseThrow(
            () -> new UsernameNotFoundException("Token não encontrado!")
        );

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

        return ResponseEntity.ok("Email validado com sucesso.");
    }

    @Transactional
    public ResponseEntity<ApiResponse> createUser(@Valid @NotNull UsuarioDTO usuarioDTO,
        UriComponentsBuilder uriComponentsBuilder) {
        boolean emailvalido = emailValidator.test(usuarioDTO.email());
        if (Boolean.FALSE.equals(emailvalido)) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new MensagemResponse("E-mail com formato inválido."));
        }

        var usuario = usuarioMapper.toEntity(usuarioDTO);
        boolean userExists = usuarioRepository.existsByEmail(usuario.getEmail());
        if (Boolean.TRUE.equals(userExists)) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new MensagemResponse("E-mail já existente"));
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuarioRepository.save(usuario);

        UsuarioVerificadorEntity usuarioVerificador = new UsuarioVerificadorEntity();
        usuarioVerificador.setUsuario(usuario);
        usuarioVerificador.setUuid(UUID.randomUUID());
        usuarioVerificador.setDataExpira(Instant.now().plus(15, ChronoUnit.MINUTES));
        usuarioVerificadorRepository.save(usuarioVerificador);

        var uri = uriComponentsBuilder.path("/api/user/{id}")
            .buildAndExpand(usuario.getId()).toUri();

        emailService.sendEmail(
            usuario.getEmail(),
            "Verificar e-mail",
            emailService.buildEmail(usuario.getNome(), confirmEmailLink(usuarioVerificador.getUuid()))
        );

        return ResponseEntity.created(uri).body(new UsuarioResponseEntityBody(usuario));
    }

    private String confirmEmailLink(UUID uuid) {
        return "http://localhost:8080/api/auth/register/confirm?token=" + uuid; 
    }
}
