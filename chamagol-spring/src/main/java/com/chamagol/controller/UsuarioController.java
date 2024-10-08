package com.chamagol.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.UsuarioDTO;
import com.chamagol.dto.UsuarioListagem;
import com.chamagol.dto.UsuarioUpdate;
import com.chamagol.dto.mapper.UsuarioMapper;
import com.chamagol.model.Usuario;
import com.chamagol.repository.UsuarioRepository;
import com.chamagol.service.UsuarioService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/user")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public UsuarioDTO create(@RequestBody @Valid @NotNull UsuarioDTO usuarioDTO) {
        return usuarioService.create(usuarioDTO);
    }

    @GetMapping
    public List<UsuarioListagem> lista() {
        return usuarioService.listagem();
    }

    @PutMapping
    public UsuarioDTO update(@RequestBody @Valid @NotNull UsuarioUpdate usuarioUpdate) {
        return usuarioService.update(usuarioUpdate);
    }
}
