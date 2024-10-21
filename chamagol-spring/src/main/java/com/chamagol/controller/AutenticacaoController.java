package com.chamagol.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.UsuarioAutenticacao;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/login")
public class AutenticacaoController {

    private AuthenticationManager authenticationManager;

    public AutenticacaoController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping()
    public ResponseEntity<Object> userLogin(@RequestBody @Valid UsuarioAutenticacao usuarioAutenticacao) {
        var token = new UsernamePasswordAuthenticationToken(
                usuarioAutenticacao.email(),
                usuarioAutenticacao.senha());

        authenticationManager.authenticate(token);

        return ResponseEntity.ok().build();
    }
}
