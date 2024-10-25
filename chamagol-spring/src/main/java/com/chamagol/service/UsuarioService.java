package com.chamagol.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.ApiResponse;
import com.chamagol.dto.MensagemResponse;
import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.usuario.UsuarioResponseEntityBody;
import com.chamagol.dto.usuario.UsuarioUpdate;
import com.chamagol.dto.usuario.mapper.UsuarioMapper;
import com.chamagol.enums.Status;
import com.chamagol.model.Usuario;
import com.chamagol.repository.UsuarioRepository;

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

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.passwordEncoder = passwordEncoder;
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

        var uri = uriComponentsBuilder.path("/api/user/{id}")
                .buildAndExpand(usuario.getId()).toUri();

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

    public ResponseEntity<List<UsuarioListagem>> listagemActive() {
        var lista = usuarioRepository.findByStatus(Status.ACTIVE)
                .stream()
                .map(UsuarioListagem::new)
                .toList();

        return ResponseEntity.ok(lista);
    }

    public ResponseEntity<List<UsuarioListagem>> listagemInactive() {
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
            @Valid @NotNull UsuarioUpdate usuarioUpdate) {
        var user = usuarioRepository.getReferenceById(usuarioUpdate.id());
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
