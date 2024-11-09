package com.chamagol.service;

import java.net.URI;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
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
    public ResponseEntity<ApiResponse> createUser(
            @Valid @NotNull UsuarioDTO usuarioDTO,
            UriComponentsBuilder uriComponentsBuilder) {

        // Validação do formato do e-mail
        if (!isEmailValid(usuarioDTO.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MensagemResponse("E-mail com formato inválido."));
        }

        // Verificação de e-mail existente
        if (isEmailAlreadyRegistered(usuarioDTO.email())) {
            // Envia um novo email para validar o email, se ele estiver inativo
            return resendLink(usuarioDTO.email());
        }

        // Criação do usuário
        Usuario usuario = saveUsuario(usuarioDTO);

        // Criação do verificador de usuário
        UsuarioVerificadorEntity usuarioVerificador = createUsuarioVerificador(usuario);

        // Envio de e-mail de confirmação
        sendConfirmationEmail(usuario, usuarioVerificador);

        // Construção do URI e retorno da resposta
        URI uri = buildUserUri(uriComponentsBuilder, usuario.getId());
        return ResponseEntity.created(uri).body(new UsuarioResponseEntityBody(usuario));
    }

    private boolean isEmailValid(String email) {
        return emailValidator.test(email);
    }

    private boolean isEmailAlreadyRegistered(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    private ResponseEntity<ApiResponse> resendLink(String email) {
        Usuario usuario = (Usuario) usuarioRepository.findByEmail(email).orElseThrow(
            () -> new UsernameNotFoundException("email não encontrado: " + email)
        );

        if (usuario.getStatus() == Status.ACTIVE) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new MensagemResponse("Esse usuario já está ativo!"));
        }

        UsuarioVerificadorEntity verificador = usuarioVerificadorRepository.findByUsuarioId(usuario.getId()).orElseThrow();
        updateVerificador(verificador);

        sendConfirmationEmail(usuario, verificador);
        return ResponseEntity.status(HttpStatus.OK).body(new MensagemResponse("Email de confirmação enviado."));

    }

    private void updateVerificador(UsuarioVerificadorEntity verificador) {
        verificador.setUuid(UUID.randomUUID());
        verificador.setDataExpira(Instant.now().plus(15, ChronoUnit.MINUTES));
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

    private String formatName(String nome) {
        String[] nomes = nome.split(" ");
        return StringUtils.capitalize(nomes[0]);
    }

    private void sendConfirmationEmail(Usuario usuario, UsuarioVerificadorEntity usuarioVerificador) {
        String emailBody = emailService.buildEmail(
                formatName(usuario.getNome()),
                confirmEmailLink(usuarioVerificador.getUuid())
        );
        emailService.sendEmail(usuario.getEmail(), "Verificar e-mail", emailBody);
    }

    private URI buildUserUri(UriComponentsBuilder uriComponentsBuilder, Long userId) {
        return uriComponentsBuilder.path("/api/user/{id}")
                .buildAndExpand(userId).toUri();
    }

    private String confirmEmailLink(UUID uuid) {
        return "http://localhost:8080/api/auth/register/confirm?token=" + uuid;
    }
}
