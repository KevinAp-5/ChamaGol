package com.chamagol.service;


import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.repository.UsuarioRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Service
public class AutenticacaoService implements UserDetailsService {

    private UsuarioRepository usuarioRepository;
    private TokenService tokenService;
    private PasswordResetService passwordResetService;
    private RegistroService registroService;

    @Autowired
    public void setRegistroService(RegistroService registroService) {
        this.registroService = registroService;
    }

    @Autowired
    public void setUsuarioRepository(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Autowired
    public void setTokenService(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Autowired
    public void setPasswordResetService(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return usuarioRepository.findByEmail(username).orElseThrow(
            () -> new UsernameNotFoundException("Usuário não encontrado")
        );
    }

    public ResponseEntity<Object> userLogin(@Valid @NotNull UsuarioAutenticacao usuarioAutenticacao) {
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
