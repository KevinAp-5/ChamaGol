package com.chamagol.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.usuario.UsuarioResponseEntityBody;
import com.chamagol.dto.usuario.UsuarioUpdate;
import com.chamagol.dto.usuario.mapper.UsuarioMapper;
import com.chamagol.dto.util.ApiResponse;
import com.chamagol.dto.util.MensagemResponse;
import com.chamagol.enums.Status;
import com.chamagol.model.Usuario;
import com.chamagol.model.UsuarioVerificadorEntity;
import com.chamagol.repository.UsuarioRepository;
import com.chamagol.repository.UsuarioVerificadorRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Service
@Validated
public class UsuarioService {
    private UsuarioRepository usuarioRepository;
    private UsuarioMapper usuarioMapper;
    private PasswordEncoder passwordEncoder;
    private UsuarioVerificadorRepository usuarioVerificadorRepository;
    private EmailService emailService;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Autowired
    public void setUsuarioVerificadorRepository(UsuarioVerificadorRepository usuarioVerificadorRepository) {
        this.usuarioVerificadorRepository = usuarioVerificadorRepository;
    }

    @Transactional
    public ResponseEntity<ApiResponse> create(
            @Valid @NotNull UsuarioDTO usuarioDTO,
            UriComponentsBuilder uriComponentsBuilder) {

        var usuario = usuarioMapper.toEntity(usuarioDTO);
        if (Boolean.TRUE.equals(usuarioRepository.existsByEmail(usuario.getEmail()))) {
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
            "ChamaGol - Verificar e-mail",
            "Você está recebendo um email de cadastro, o número de validação é: " + usuarioVerificador.getUuid()
        );

        return ResponseEntity.created(uri).body(new UsuarioResponseEntityBody(usuario));
    }

    public Boolean userExists(Usuario usuario) {
        return usuarioRepository.existsByEmail(usuario.getEmail());
    }

    public ResponseEntity<List<UsuarioDTO>> lista() {
        var lista = usuarioRepository.findAll()
                .stream()
                .map(usuarioMapper::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(lista);
    }

    public ResponseEntity<List<UsuarioListagem>> listActive() {
        var lista = usuarioRepository.findByStatus(Status.ACTIVE)
                .stream()
                .map(UsuarioListagem::new)
                .toList();

        return ResponseEntity.ok(lista);
    }

    public ResponseEntity<List<UsuarioListagem>> listInactive() {
        var lista = usuarioRepository.findByStatus(Status.INACTIVE)
                .stream()
                .map(UsuarioListagem::new)
                .toList();

        return ResponseEntity.ok(lista);
    }

    public ResponseEntity<UsuarioResponseEntityBody> findById(@NotNull @Positive Long id) {
        var user = usuarioRepository.getReferenceById(id);

        return ResponseEntity.ok(new UsuarioResponseEntityBody(user));
    }

    @Transactional
    public ResponseEntity<UsuarioResponseEntityBody> update(
            @Valid @NotNull @Positive Long id,
            @Valid @NotNull UsuarioUpdate usuarioUpdate) {
        Usuario user = usuarioRepository.findById(id).orElseThrow(
            () -> new UsernameNotFoundException("Usuário não encontrado")
        );

        user.updateUsuario(usuarioUpdate);
        return ResponseEntity.ok(new UsuarioResponseEntityBody(user));
    }

    @Transactional
    public ResponseEntity<Void> delete(@NotNull @Positive Long id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> deleteSoft(@NotNull @Positive Long id) {
        Usuario usuario = usuarioRepository.getReferenceById(id);
        usuario.inactivateUsario();

        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> activate(@NotNull @Positive Long id) {
        Usuario usuario = usuarioRepository.getReferenceById(id);
        usuario.activateUsuario();
        return ResponseEntity.noContent().build();
    }

}
