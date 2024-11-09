package com.chamagol.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.usuario.UsuarioResponseEntityBody;
import com.chamagol.dto.usuario.UsuarioUpdate;
import com.chamagol.dto.usuario.mapper.UsuarioMapper;
import com.chamagol.dto.util.ApiResponse;
import com.chamagol.enums.Status;
import com.chamagol.model.Usuario;
import com.chamagol.repository.UsuarioRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Service
@Validated
public class UsuarioService {
    private UsuarioRepository usuarioRepository;
    private UsuarioMapper usuarioMapper;
    private RegistroService registroService;

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper,
            RegistroService registroService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.registroService = registroService;
    }

    @Transactional
    public ResponseEntity<ApiResponse> create(
            @Valid @NotNull UsuarioDTO usuarioDTO, UriComponentsBuilder uriComponentsBuilder) {
        return registroService.createUser(usuarioDTO, uriComponentsBuilder);
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

    public ResponseEntity<UsuarioListagem> getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Usuario user = (Usuario) usuarioRepository.findByEmail(email).orElseThrow(
            () -> new UsernameNotFoundException("Usuário não encontrado: " + email)
        );

        return ResponseEntity.ok(new UsuarioListagem(user));
    }
}
