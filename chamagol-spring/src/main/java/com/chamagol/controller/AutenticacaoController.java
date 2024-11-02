// AutenticacaoController.java
package com.chamagol.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.service.AutenticacaoService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {

    private AutenticacaoService autenticacaoService;

    @Autowired
    public void setAutenticacaoService(AutenticacaoService autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
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
}
