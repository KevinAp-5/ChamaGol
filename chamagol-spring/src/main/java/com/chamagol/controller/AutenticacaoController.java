// AutenticacaoController.java
package com.chamagol.controller;

import java.net.URI;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.token.RefreshTokenDTO;
import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.usuario.mapper.UsuarioMapper;
import com.chamagol.dto.util.ApiResponse;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.model.Usuario;
import com.chamagol.service.auth.AutenticacaoService;
import com.chamagol.service.user.RegistroService;
import com.chamagol.service.user.UsuarioCacheService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;
    private final RegistroService registroService;
    private final UsuarioCacheService usuarioCacheService;
    private final UsuarioMapper usuarioMapper;

    public AutenticacaoController(AutenticacaoService autenticacaoService, RegistroService registroService,
            UsuarioCacheService usuarioCacheService, UsuarioMapper usuarioMapper) {
        this.autenticacaoService = autenticacaoService;
        this.registroService = registroService;
        this.usuarioCacheService = usuarioCacheService;
        this.usuarioMapper = usuarioMapper;
    }

    @PostMapping("/register")
    @ResponseStatus(code = HttpStatus.CREATED)
    @Transactional
    public ResponseEntity<ApiResponse<UsuarioListagem>> create(
        @RequestBody @Valid @NotNull UsuarioDTO usuarioDTO,
        UriComponentsBuilder uriComponentsBuilder
        ) {

        var uri = buildUserUri(uriComponentsBuilder, usuarioDTO.id());
        var response = registroService.createUser(usuarioDTO);
        Usuario user = usuarioMapper.toEntity(usuarioDTO);

        usuarioCacheService.atualizarUsuario(user.getEmail(), user);

        return ResponseEntity.created(uri).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody @Valid UsuarioAutenticacao usuarioAutenticacao) {
        return ResponseEntity.ok(autenticacaoService.userLogin(usuarioAutenticacao));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenDTO> refreshSession(@RequestBody RefreshTokenDTO tokenDTO) {
        return ResponseEntity.ok(autenticacaoService.userRefreshToken(tokenDTO.refreshToken()));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<String> requestPasswordReset(
        @RequestBody @Valid ResetPasswordBody resetPasswordBody
    ) {
        return ResponseEntity.ok(autenticacaoService.resetSenhaEmail(resetPasswordBody));
    }

    @GetMapping("/password/reset/confirm")
    public ResponseEntity<String> confirmResetPassword(
        @RequestParam("token") @NotBlank String token,
        @RequestBody @Valid ConfirmPasswordBody confirmPasswordBody
    ) {
        return ResponseEntity.ok(autenticacaoService.confirmarRecuperacaoSenha(token, confirmPasswordBody));
    }

    @GetMapping("/register/confirm")
    public ResponseEntity<String> confirmUser (@RequestParam("token") String uuid) {
        boolean userConfirmed = registroService.confirmUser(UUID.fromString(uuid));
        if (!userConfirmed) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Erro ao validar email");
        }

        return ResponseEntity.ok("Email validado com sucesso. Você já pode fazer login!");
    }

    private URI buildUserUri(UriComponentsBuilder uriComponentsBuilder, Long userId) {
        return uriComponentsBuilder.path("/api/user/{id}")
            .buildAndExpand(userId).toUri();
    }
}
