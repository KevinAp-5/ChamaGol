package com.chamagol.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.UsuarioDTO;
import com.chamagol.dto.UsuarioListagem;
import com.chamagol.dto.UsuarioResponseEntityBody;
import com.chamagol.dto.UsuarioUpdate;
import com.chamagol.dto.mapper.UsuarioMapper;
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
    public ResponseEntity<UsuarioResponseEntityBody> create(
            @Valid @NotNull UsuarioDTO usuarioDTO,
            UriComponentsBuilder uriComponentsBuilder) {

        var usuario = usuarioMapper.toEntity(usuarioDTO);
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        usuarioRepository.save(usuario);

        var uri = uriComponentsBuilder.path("/api/user/{id}")
                .buildAndExpand(usuario.getId()).toUri();

        return ResponseEntity.created(uri).body(new UsuarioResponseEntityBody(usuario));
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
