package com.chamagol.service.user;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.usuario.UsuarioResponseEntityBody;
import com.chamagol.dto.usuario.UsuarioUpdate;
import com.chamagol.enums.Roles;
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

    private final UsuarioRepository usuarioRepository;
    private final UsuarioCacheService usuarioCacheService;

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioCacheService usuarioCacheService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioCacheService = usuarioCacheService;
    }

    public UserDetails getUsuario(String email) {
        return usuarioCacheService.getUsuarioFromCache(email);
    }

    public void evictUsuario(String email) {
        usuarioCacheService.evictUsuario(email);
    }

    public void atualizarUsuario(String email, Usuario usuario) {
        usuarioCacheService.atualizarUsuario(email, usuario);
    }

    public Page<UsuarioListagem> lista(Pageable pageable) {
        return usuarioRepository.findAll(pageable).map(UsuarioListagem:: new);
    }

    public Page<UsuarioListagem> listActive(Pageable pageable) {
        return usuarioRepository.findByStatus(Status.ACTIVE, pageable).map(UsuarioListagem:: new);
    }

    public Page<UsuarioListagem> listInactive(Pageable pageable) {
        return usuarioRepository.findByStatus(Status.INACTIVE, pageable).map(UsuarioListagem:: new);
    }

    public UsuarioResponseEntityBody findById(@NotNull @Positive Long id) {
        var user = usuarioRepository.getReferenceById(id);
        return new UsuarioResponseEntityBody(user);
    }

    @CacheEvict(value = "usuarioCache", key = "#email")
    @Transactional
    public UsuarioResponseEntityBody update(
            @Valid @NotNull @Positive Long id,
            @Valid @NotNull UsuarioUpdate usuarioUpdate) {
        Usuario user = usuarioRepository.findById(id).orElseThrow(
            () -> new UsernameNotFoundException("Usuário não encontrado")
        );

        user.updateUsuario(usuarioUpdate);
        usuarioRepository.save(user);
        return new UsuarioResponseEntityBody(user);
    }

    @Transactional
    public void delete(@NotNull @Positive Long id) {
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public void deleteSoft(@NotNull @Positive Long id) {
        Usuario usuario = usuarioRepository.getReferenceById(id);
        usuario.setStatus(Status.INACTIVE);
        evictUsuario(usuario.getEmail());
        usuarioRepository.save(usuario);

    }

    @CacheEvict(value = "usuarioCache", key = "#email")
    @Transactional
    public void activate(@NotNull @Positive Long id) {
        Usuario usuario = usuarioRepository.getReferenceById(id);
        usuario.activateUsuario();
        evictUsuario(usuario.getEmail());
        usuarioRepository.save(usuario);
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

    @CachePut(value = "usuarioCache", key = "#email")
    public UserDetails atualizarUsuario(Usuario usuario) {
        evictUsuario(usuario.getEmail());
        return usuarioRepository.save(usuario);

    }

    public void turnIntoMestre(UsuarioDTO usuarioDTO) {
        Usuario user = new Usuario(usuarioDTO);
        user.setUserRole(Roles.MESTRE);
        usuarioRepository.save(user);
        usuarioCacheService.evictUsuario(usuarioDTO.email());
    }

    public void turnIntoAdmin(UsuarioDTO usuarioDTO) {
        Usuario user = new Usuario(usuarioDTO);
        user.setUserRole(Roles.ADMIN);
        usuarioRepository.save(user);
        usuarioCacheService.evictUsuario(usuarioDTO.email());
    }
}
