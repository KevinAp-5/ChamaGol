package com.chamagol.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import com.chamagol.dto.UsuarioDTO;
import com.chamagol.dto.UsuarioListagem;
import com.chamagol.dto.UsuarioResponseEntityBody;
import com.chamagol.dto.UsuarioUpdate;
import com.chamagol.dto.mapper.UsuarioMapper;
import com.chamagol.model.Usuario;
import com.chamagol.enums.Status;
import com.chamagol.repository.UsuarioRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Service
@Validated
public class UsuarioService {
    public final UsuarioRepository usuarioRepository;
    public final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
    }

    @Transactional
    public UsuarioDTO create(@Valid @NotNull UsuarioDTO usuarioDTO) {
        return usuarioMapper.toDTO(usuarioRepository.save(usuarioMapper.toEntity(usuarioDTO)));
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
        .map(UsuarioListagem:: new)
        .toList();

        return ResponseEntity.ok(lista);
    }

    public ResponseEntity<List<UsuarioListagem>> listagemInactive() {
        var lista = usuarioRepository.findByStatus(Status.INACTIVE)
        .stream()
        .map(UsuarioListagem:: new)
        .toList();

        return ResponseEntity.ok(lista);
    }

    public ResponseEntity<UsuarioDTO> findById(@NotNull @Positive Long id) {
        var user = usuarioRepository.findById(id).map(usuarioMapper::toDTO)
            .orElseThrow(NoSuchElementException:: new);

        return ResponseEntity.ok(user);
    }

    @Transactional
    public ResponseEntity<UsuarioResponseEntityBody> update(
        @Valid @NotNull UsuarioUpdate usuarioUpdate
        ) {
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
