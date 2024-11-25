package com.chamagol.service;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Service
@Validated
public class UsuarioService {
    private UsuarioRepository usuarioRepository;
    private UsuarioMapper usuarioMapper;
    private RegistroService registroService;
    private CachedAuthenticationProvider cachedAuthenticationProvider;

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper,
            RegistroService registroService, CachedAuthenticationProvider cachedAuthenticationProvider) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.registroService = registroService;
        this.cachedAuthenticationProvider = cachedAuthenticationProvider;
    }

    @Transactional
    public ResponseEntity<ApiResponse<UsuarioDTO>> create(@Valid @NotNull UsuarioDTO usuarioDTO, UriComponentsBuilder uriComponentsBuilder) {
        URI uri = buildUserUri(uriComponentsBuilder, usuarioDTO.id());
        return ResponseEntity.created(uri).body(registroService.createUser(usuarioDTO));
    }

    public List<UsuarioDTO> lista() {
        return usuarioRepository.findAll()
                .stream()
                .map(usuarioMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<UsuarioListagem> listActive() {
        return usuarioRepository.findByStatus(Status.ACTIVE)
                .stream()
                .map(UsuarioListagem::new)
                .toList();
    }

    public List<UsuarioListagem> listInactive() {
        return usuarioRepository.findByStatus(Status.INACTIVE)
                .stream()
                .map(UsuarioListagem::new)
                .toList();
    }

    public UsuarioResponseEntityBody findById(@NotNull @Positive Long id) {
        var user = usuarioRepository.getReferenceById(id);
        return new UsuarioResponseEntityBody(user);
    }

    @CacheEvict(value = "usuario", key = "#email")
    @Transactional
    public UsuarioResponseEntityBody update(
            @Valid @NotNull @Positive Long id,
            @Valid @NotNull UsuarioUpdate usuarioUpdate) {
        Usuario user = usuarioRepository.findById(id).orElseThrow(
            () -> new UsernameNotFoundException("Usuário não encontrado")
        );

        user.updateUsuario(usuarioUpdate);
        return new UsuarioResponseEntityBody(user);
    }

    @Transactional
    public void delete(@NotNull @Positive Long id) {
        usuarioRepository.deleteById(id);
    }

    @CacheEvict(value = "usuario", key = "#email")
    @Transactional
    public void deleteSoft(@NotNull @Positive Long id) {
        Usuario usuario = usuarioRepository.getReferenceById(id);
        usuario.inactivateUsario();
    }

    @CacheEvict(value = "usuario", key = "#email")
    @Transactional
    public void activate(@NotNull @Positive Long id) {
        Usuario usuario = usuarioRepository.getReferenceById(id);
        usuario.activateUsuario();
    }

    public UsuarioListagem getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Usuario user = (Usuario) this.getUsuario(email);

        return new UsuarioListagem(user);
    }

    public UsuarioResponseEntityBody getUsuarioByEmail(String email) {
        Usuario user = (Usuario) this.getUsuario(email);

        return new UsuarioResponseEntityBody(user);
    }

    public Boolean userExistsByEmail(@NotBlank String email) {
        return usuarioRepository.findByEmail(email).isPresent();
    }

    @Cacheable(value = "usuario", key = "#email", unless = "#result == null")
    public UserDetails getUsuario(String email) {
        return cachedAuthenticationProvider.loadUserByUsername(email);
    }

    @CacheEvict(value = "usuario", key = "#email")
    public void usuarioEvict() {
        // Método para limpar o cache do usuário

    }

    @CachePut(value = "usuario", key = "#usuario.email")
    public UserDetails atualizarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    private URI buildUserUri(UriComponentsBuilder uriComponentsBuilder, Long userId) {
        return uriComponentsBuilder.path("/api/user/{id}")
                .buildAndExpand(userId).toUri();
    }
}
