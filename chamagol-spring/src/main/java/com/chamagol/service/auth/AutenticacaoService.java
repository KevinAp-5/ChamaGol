package com.chamagol.service.auth;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.chamagol.dto.token.AccessToken;
import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.enums.Status;
import com.chamagol.exception.EmailNotConfirmed;
import com.chamagol.exception.TokenInvalid;
import com.chamagol.model.ControleEmail;
import com.chamagol.model.Usuario;
import com.chamagol.model.UsuarioVerificadorEntity;
import com.chamagol.repository.UsuarioVerificadorRepository;
import com.chamagol.service.user.UsuarioService;
import com.chamagol.service.util.ControleEmailService;
import com.chamagol.service.util.EmailService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Service
public class AutenticacaoService {

    private final TokenService tokenService;
    private final PasswordResetService passwordResetService;
    private final UsuarioService usuarioService;
    private final EmailService emailService;
    private final UsuarioVerificadorRepository verificadorDB;
    private final ControleEmailService controleEmailService;

    public AutenticacaoService(TokenService tokenService, PasswordResetService passwordResetService,
            UsuarioService usuarioService, EmailService emailService, UsuarioVerificadorRepository verificadorDB,
            ControleEmailService controleEmailService) {
        this.tokenService = tokenService;
        this.passwordResetService = passwordResetService;
        this.usuarioService = usuarioService;
        this.emailService = emailService;
        this.verificadorDB = verificadorDB;
        this.controleEmailService = controleEmailService;
    }

    public TokenDTO userLogin(@Valid @NotNull UsuarioAutenticacao usuarioAutenticacao) {
        var user = (Usuario) usuarioService.getUsuario(usuarioAutenticacao.email());

        if (user.getStatus() != Status.ACTIVE) {
            sendActivationEmail(user);
            throw new EmailNotConfirmed("enviado email para ativar usuário.");
        }
        return tokenService.authenticatedTokenByLogin(usuarioAutenticacao);
    }

    public Boolean resetSenhaEmail(@Valid @NotNull ResetPasswordBody resetPasswordBody) {
        return passwordResetService.resetarSenhaEmail(resetPasswordBody.email());
    }

    @CacheEvict(value = "usuarioCache", allEntries = true)
    public String confirmarRecuperacaoSenha(@Valid @NotBlank ConfirmPasswordBody confirmPasswordBody) {
        boolean resetado = passwordResetService.resetPassword(confirmPasswordBody.email(),
                confirmPasswordBody.novaSenha());
        if (!resetado) {
            throw new TokenInvalid("Token inválido ou expirado");
        }
        return "Senha alterada com sucesso";
    }

    public TokenDTO userRefreshToken(String tokenDTO) {
        var subject = tokenService.getSubject(tokenDTO);
        UserDetails userDetails = usuarioService.getUsuario(subject);
        Usuario user = (Usuario) userDetails;

        if (user.getStatus() == Status.INACTIVE) {
            throw new EmailNotConfirmed(user.getEmail());
        }

        var token = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(token);

        return tokenService.tokenBuilder(user);
    }

    private void sendActivationEmail(Usuario user, UUID uuid) {
        String formatedName = emailService.formatName(user.getNome());
        String link = emailService.confirmEmailLink(uuid);
        String emailText = emailService.buildEmail(formatedName, link);
        emailService.sendEmail(
                user.getEmail(),
                "Ativar usuário",
                emailText);
        controleEmailService.setControleEmail(user);
    }

    private UsuarioVerificadorEntity returnVerificador(Usuario user) {
        return verificadorDB.findByUsuarioId(user.getId()).orElse(new UsuarioVerificadorEntity());
    }

    private void sendActivationEmail(Usuario user) {
        UUID uuid = UUID.randomUUID();
        UsuarioVerificadorEntity ativador = returnVerificador(user);
        ativador.setDataExpira(Instant.now().plus(20, ChronoUnit.MINUTES));
        ativador.setUsuario(user);
        ativador.setUuid(uuid);

        verificadorDB.save(ativador);
        ControleEmail email = controleEmailService.getControleEmail(user.getId());

        Boolean condition = Duration.between(email.getUltimoEmail(), Instant.now()).toMinutes() >= 10;
        if (email.getQuantidadeEmails() == null || condition.booleanValue()) {
            sendActivationEmail(user, uuid);
        }
    }
}
