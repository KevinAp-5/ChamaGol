package com.chamagol.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.model.Usuario;
import com.chamagol.service.PasswordResetService;
import com.chamagol.service.TokenService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {

    private AuthenticationManager authenticationManager;
    private TokenService tokenService;
    private PasswordResetService passwordResetService;

    public AutenticacaoController(AuthenticationManager authenticationManager, TokenService tokenService,
            PasswordResetService passwordResetService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> userLogin(@RequestBody @Valid UsuarioAutenticacao usuarioAutenticacao) {
        var token = new UsernamePasswordAuthenticationToken(
                usuarioAutenticacao.email(),
                usuarioAutenticacao.senha());
        var auth = authenticationManager.authenticate(token);

        var tokenJWT = tokenService.getToken((Usuario) auth.getPrincipal());

        return ResponseEntity.ok(new TokenDTO(tokenJWT));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> requestSenhaReset(@RequestBody @Valid ResetPasswordBody resetPasswordBody) {
        passwordResetService.resetarSenhaEmail(resetPasswordBody.email());
        return ResponseEntity.ok("Link de redefinição de senha enviado para o e-mail.");
    }

    @PostMapping("reset-password/confirm")
    public ResponseEntity<String> confirmarSenhaReset(
            @RequestParam("token") @NotBlank String token,
            @RequestBody @Valid ConfirmPasswordBody confirmPasswordBody) {

        boolean resetado = passwordResetService.resetPassword(
            token,
            confirmPasswordBody.novaSenha()
        );

        if (!resetado) {
            return ResponseEntity.status(400).body("Token inválido ou expirado.");
        }

        return ResponseEntity.ok("Senha alterada com sucesso!");
    }
}
