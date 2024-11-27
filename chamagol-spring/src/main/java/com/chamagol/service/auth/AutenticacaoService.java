package com.chamagol.service.auth;


import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.enums.Status;
import com.chamagol.exception.EmailNotConfirmed;
import com.chamagol.exception.TokenInvalid;
import com.chamagol.service.user.UsuarioService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Service
public class AutenticacaoService {

    private final TokenService tokenService;
    private final PasswordResetService passwordResetService;
    private final UsuarioService usuarioService;

    public AutenticacaoService(TokenService tokenService, PasswordResetService passwordResetService,
            UsuarioService usuarioService) {
        this.tokenService = tokenService;
        this.passwordResetService = passwordResetService;
        this.usuarioService = usuarioService;
    }

    public TokenDTO userLogin(@Valid @NotNull UsuarioAutenticacao usuarioAutenticacao) {
        if (Boolean.FALSE.equals(usuarioService.userExistsByEmail(usuarioAutenticacao.email()))) {
            throw new UsernameNotFoundException(usuarioAutenticacao.email());
        }

        if (usuarioService.getUsuarioByEmail(usuarioAutenticacao.email()).status() != Status.ACTIVE) {
            throw new EmailNotConfirmed("Confirme o email para ativá-lo");
        }

        var tokenJWT = tokenService.authenticatedTokenByLogin(usuarioAutenticacao);
        return new TokenDTO(tokenJWT);
    }

    public String resetSenhaEmail(@Valid @NotNull ResetPasswordBody resetPasswordBody) {
        boolean valid = passwordResetService.resetarSenhaEmail(resetPasswordBody.email());
        if (Boolean.FALSE.equals(valid)) {
            throw new TokenInvalid("Erro ao recuperar senha");
        }
        return "Link para redefinir senha foi enviada para o e-mail.";
    }

    public String confirmarRecuperacaoSenha(@NotBlank String token, @Valid @NotBlank ConfirmPasswordBody confirmPasswordBody) {
        boolean resetado = passwordResetService.resetPassword(token, confirmPasswordBody.novaSenha());
        if (!resetado) {
            throw new TokenInvalid("Token inválido ou expirado");
        }
        return "Senha alterada com sucesso";
    }

}
