package com.chamagol.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.service.user.UsuarioService;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UsuarioService usuarioService;

    public MeController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping()
    public ResponseEntity<UsuarioListagem> getAuthenticatedUser() {
        return ResponseEntity.ok(usuarioService.getMe());
    }
}
