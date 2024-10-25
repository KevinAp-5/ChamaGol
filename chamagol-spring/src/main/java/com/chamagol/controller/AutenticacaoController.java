package com.chamagol.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.model.Usuario;
import com.chamagol.service.TokenService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/login")
public class AutenticacaoController {

    private AuthenticationManager authenticationManager;
    private TokenService tokenService;

    public AutenticacaoController(AuthenticationManager authenticationManager, TokenService tokenService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @PostMapping()
    public ResponseEntity<Object> userLogin(@RequestBody @Valid UsuarioAutenticacao usuarioAutenticacao) {
        var token = new UsernamePasswordAuthenticationToken(
                usuarioAutenticacao.email(),
                usuarioAutenticacao.senha());
        var auth = authenticationManager.authenticate(token);

        var tokenJWT = tokenService.getToken((Usuario) auth.getPrincipal());

        return ResponseEntity.ok(new TokenDTO(tokenJWT));
    }
}
