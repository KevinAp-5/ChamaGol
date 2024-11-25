// AutenticacaoController.java
package com.chamagol.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.util.ApiResponse;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.service.auth.AutenticacaoService;
import com.chamagol.service.user.RegistroService;
import com.chamagol.service.user.UsuarioService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {

    private final UsuarioService usuarioService;
    private final AutenticacaoService autenticacaoService;
    private final RegistroService registroService;

    public AutenticacaoController(UsuarioService usuarioService, AutenticacaoService autenticacaoService,
            RegistroService registroService) {
        this.usuarioService = usuarioService;
        this.autenticacaoService = autenticacaoService;
        this.registroService = registroService;
    }

    @PostMapping("/register")
    @ResponseStatus(code = HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<UsuarioDTO>> create(
        @RequestBody @Valid @NotNull UsuarioDTO usuarioDTO,
        UriComponentsBuilder uriComponentsBuilder
        ) {
        return usuarioService.create(usuarioDTO, uriComponentsBuilder);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody @Valid UsuarioAutenticacao usuarioAutenticacao) {
        return ResponseEntity.ok(autenticacaoService.userLogin(usuarioAutenticacao));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<String> requestPasswordReset(
        @RequestBody @Valid ResetPasswordBody resetPasswordBody
    ) {
        return ResponseEntity.ok(autenticacaoService.resetSenhaEmail(resetPasswordBody));
    }

    @PostMapping("/password/reset/confirm")
    public ResponseEntity<String> confirmResetPassword(
        @RequestParam("token") @NotBlank String token,
        @RequestBody @Valid ConfirmPasswordBody confirmPasswordBody
    ) {
        return ResponseEntity.ok(autenticacaoService.confirmarRecuperacaoSenha(token, confirmPasswordBody));
    }

    @PostMapping("/register/confirm")
    public ResponseEntity<String> confirmUser (@RequestParam("token") String uuid) {
        boolean userConfirmed = registroService.confirmUser(UUID.fromString(uuid));
        if (!userConfirmed) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Erro ao validar email");
        }

        return ResponseEntity.ok("Email validado com sucesso.");
    }
}
