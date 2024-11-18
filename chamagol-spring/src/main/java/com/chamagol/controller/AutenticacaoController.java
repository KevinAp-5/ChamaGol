// AutenticacaoController.java
package com.chamagol.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.util.ApiResponse;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.service.AutenticacaoService;
import com.chamagol.service.UsuarioService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {

    private UsuarioService usuarioService;
    private AutenticacaoService autenticacaoService;

    @Autowired
    public void setUsuarioService(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Autowired
    public void setAutenticacaoService(AutenticacaoService autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
    }

    @PostMapping("/register")
    @ResponseStatus(code = HttpStatus.CREATED)
    public ResponseEntity<ApiResponse> create(
        @RequestBody @Valid @NotNull UsuarioDTO usuarioDTO,
        UriComponentsBuilder uriComponentsBuilder
        ) {
        return usuarioService.create(usuarioDTO, uriComponentsBuilder);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody @Valid UsuarioAutenticacao usuarioAutenticacao) {
        return autenticacaoService.userLogin(usuarioAutenticacao);
    }

    @PostMapping("/password/reset")
    public ResponseEntity<String> requestPasswordReset(
        @RequestBody @Valid ResetPasswordBody resetPasswordBody
    ) {
        return autenticacaoService.resetSenhaEmail(resetPasswordBody);
    }

    @PostMapping("/password/reset/confirm")
    public ResponseEntity<String> confirmResetPassword(
        @RequestParam("token") @NotBlank String token,
        @RequestBody @Valid ConfirmPasswordBody confirmPasswordBody
    ) {
        return autenticacaoService.confirmarRecuperacaoSenha(token, confirmPasswordBody);
    }

    @PostMapping("/register/confirm")
    public ResponseEntity<String> confirmUser (@RequestParam("token") String uuid) {
        return autenticacaoService.confirmUser(UUID.fromString(uuid));
    }
}
