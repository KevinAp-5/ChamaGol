package com.chamagol.service;


import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.enums.Status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Service
public class AutenticacaoService {

    private final TokenService tokenService;
    private final PasswordResetService passwordResetService;
    private final RegistroService registroService;
    private final UsuarioService usuarioService;

    public AutenticacaoService(TokenService tokenService, PasswordResetService passwordResetService, RegistroService registroService, UsuarioService usuarioService) {
        this.tokenService = tokenService;
        this.passwordResetService = passwordResetService;
        this.registroService = registroService;
        this.usuarioService = usuarioService;
    }

    public ResponseEntity<Object> userLogin(@Valid @NotNull UsuarioAutenticacao usuarioAutenticacao) {
        if (Boolean.FALSE.equals(usuarioService.userExistsByEmail(usuarioAutenticacao.email()))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
        }

        if (usuarioService.getUsuarioByEmail(usuarioAutenticacao.email()).status() != Status.ACTIVE) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não foi ativado: Confirme o email para ativá-lo");
        }

        var tokenJWT = tokenService.authenticatedTokenByLogin(usuarioAutenticacao);
        return ResponseEntity.ok(new TokenDTO(tokenJWT));
    }

    public ResponseEntity<String> resetSenhaEmail(@Valid @NotNull ResetPasswordBody resetPasswordBody) {
        boolean valid = passwordResetService.resetarSenhaEmail(resetPasswordBody.email());
        if (Boolean.FALSE.equals(valid)) {
            return ResponseEntity.status(400).body("Erro ao recuperar senha");
        }
        return ResponseEntity.ok("Link para redefinir senha foi enviada para o e-mail.");
    }

    public ResponseEntity<String> confirmarRecuperacaoSenha(@NotBlank String token, @Valid @NotBlank ConfirmPasswordBody confirmPasswordBody) {
        boolean resetado = passwordResetService.resetPassword(token, confirmPasswordBody.novaSenha());
        if (!resetado) {
            return ResponseEntity.status(400).body("Token inválido ou expirado");
        }
        return ResponseEntity.ok("Senha alterada com sucesso");
    }

    public ResponseEntity<String> confirmUser(UUID uuid) {
        return registroService.confirmUser(uuid);
    }

}
