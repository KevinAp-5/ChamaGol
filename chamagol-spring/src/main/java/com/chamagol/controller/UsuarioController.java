package com.chamagol.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.UsuarioDTO;
import com.chamagol.model.Usuario;
import com.chamagol.repository.UsuarioRepository;
import com.chamagol.service.UsuarioService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    @Transactional
    public void create(@RequestBody @Valid UsuarioDTO dadosUsuario) {
        Usuario usuario = new Usuario(dadosUsuario);
        System.out.println(usuario);
        Usuario usuarioRepository_output = usuarioRepository.save(usuario);
        System.out.println(usuarioRepository_output);
    }

}
