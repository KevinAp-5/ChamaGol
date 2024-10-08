package com.chamagol.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import com.chamagol.dto.UsuarioDTO;
import com.chamagol.dto.UsuarioListagem;
import com.chamagol.dto.UsuarioUpdate;
import com.chamagol.dto.mapper.UsuarioMapper;
import com.chamagol.model.Usuario;
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

    public List<UsuarioDTO> lista() {
        return usuarioRepository.findAll()
        .stream()
        .map(usuarioMapper::toDTO)
        .collect(Collectors.toList());
    }

    public List<UsuarioListagem> listagem() {
        return usuarioRepository.findAll()
        .stream()
        .map(UsuarioListagem:: new)
        .toList();
    }

    public UsuarioDTO findById(@NotNull @Positive Long id) {
        return usuarioRepository.findById(id).map(usuarioMapper::toDTO)
            .orElseThrow(NoSuchElementException:: new);
    }

    @Transactional
    public UsuarioDTO update(@Valid @NotNull UsuarioUpdate usuarioUpdate) {
        var user = usuarioRepository.getReferenceById(usuarioUpdate.id());
        user.updateUsuario(usuarioUpdate);

        return usuarioMapper.toDTO(user);
    }

    @Transactional
    public void delete(@NotNull @Positive Long id) {
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public void deleteSoft(@NotNull @Positive Long id) {
        Usuario usuario = usuarioRepository.getReferenceById(id);
        usuario.inactiveUsario();
    }
}
