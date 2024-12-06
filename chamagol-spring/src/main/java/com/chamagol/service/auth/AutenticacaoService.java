package com.chamagol.service.auth;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.enums.Status;
import com.chamagol.exception.EmailNotConfirmed;
import com.chamagol.exception.TokenInvalid;
import com.chamagol.model.Usuario;
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
        var user = (Usuario) usuarioService.getUsuario(usuarioAutenticacao.email());

        if (user.getStatus() != Status.ACTIVE)
            throw new EmailNotConfirmed("Confirme o email para ativá-lo");

        return tokenService.authenticatedTokenByLogin(usuarioAutenticacao);
    }

    public String resetSenhaEmail(@Valid @NotNull ResetPasswordBody resetPasswordBody) {
        boolean valid = passwordResetService.resetarSenhaEmail(resetPasswordBody.email());
        if (Boolean.FALSE.equals(valid)) {
            throw new TokenInvalid("Erro ao recuperar senha");
        }
        return "Link para redefinir senha foi enviada para o e-mail.";
    }

    @CacheEvict(value = "usuarioCache", allEntries = true)
    public String confirmarRecuperacaoSenha(@NotBlank String token,
            @Valid @NotBlank ConfirmPasswordBody confirmPasswordBody) {
        boolean resetado = passwordResetService.resetPassword(token, confirmPasswordBody.novaSenha());
        if (!resetado) {
            throw new TokenInvalid("Token inválido ou expirado");
        }
        return "Senha alterada com sucesso";
    }

    public TokenDTO userRefreshToken(String tokenDTO) {
        var subject = tokenService.getSubject(tokenDTO);
        UserDetails userDetails = usuarioService.getUsuario(subject);
        Usuario user = (Usuario) userDetails;

        var token = new UsernamePasswordAuthenticationToken(
            userDetails,
            null,
            userDetails.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(token);

        return TokenDTO
            .builder()
            .token(tokenService.getToken(user, Integer.valueOf(15)))
            .refreshToken(tokenService.getToken(user, Integer.valueOf(24*7*60)))
            .build();
    }
}
