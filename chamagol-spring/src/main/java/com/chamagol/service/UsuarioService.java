package com.chamagol.service;

import com.chamagol.dto.UsuarioDTO;
import com.chamagol.dto.mapper.UsuarioMapper;
import com.chamagol.model.Usuario;
import com.chamagol.repository.UsuarioRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class UsuarioService {
    public final UsuarioRepository usuarioRepository;
    public final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
    }

    public Usuario create(@Valid @NotNull UsuarioDTO usuarioDTO) {
        return usuarioRepository.save(new Usuario(usuarioDTO));
    }


}
