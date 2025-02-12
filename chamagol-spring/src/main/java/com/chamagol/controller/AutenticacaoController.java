// AutenticacaoController.java
package com.chamagol.controller;

import java.net.URI;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.token.AccessToken;
import com.chamagol.dto.token.RefreshTokenDTO;
import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.util.ApiResponse;
import com.chamagol.dto.util.ConfirmPasswordBody;
import com.chamagol.dto.util.ResetPasswordBody;
import com.chamagol.service.auth.AutenticacaoService;
import com.chamagol.service.user.RegistroService;
import com.chamagol.service.user.UsuarioService;
import com.esotericsoftware.minlog.Log;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@Controller
@RequestMapping("/api/auth")
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;
    private final RegistroService registroService;
    private final UsuarioService usuarioService;

    public AutenticacaoController(AutenticacaoService autenticacaoService, RegistroService registroService,
            UsuarioService usuarioService) {
        this.autenticacaoService = autenticacaoService;
        this.registroService = registroService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/register")
    @ResponseStatus(code = HttpStatus.CREATED)
    @Transactional
    public ResponseEntity<ApiResponse<UsuarioListagem>> create(
            @RequestBody @Valid @NotNull UsuarioDTO usuarioDTO,
            UriComponentsBuilder uriComponentsBuilder) {

        var uri = buildUserUri(uriComponentsBuilder, usuarioDTO.id());
        var response = registroService.createUser(usuarioDTO);

        return ResponseEntity.created(uri).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AccessToken> login(@RequestBody @Valid UsuarioAutenticacao usuarioAutenticacao, HttpServletResponse response) {
        
        TokenDTO token = autenticacaoService.userLogin(usuarioAutenticacao);
        String refreshToken = token.refreshToken();
        ResponseCookie responseCookie = ResponseCookie.from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .maxAge(60 * 60 * 24 * (long) 7)
            .path("/api/auth/refresh-token")
            .build();

        response.addHeader(HttpHeaders.SET_COOKIE, responseCookie.toString());

        return ResponseEntity.ok(new AccessToken(token.token()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AccessToken> refreshSession(@CookieValue("refresh_token") String refreshToken) {
        TokenDTO tokens = autenticacaoService.userRefreshToken(refreshToken);
        return ResponseEntity.ok(new AccessToken(tokens.token()));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<String> requestPasswordReset(@RequestBody @Valid ResetPasswordBody resetPasswordBody) {
        boolean canReset = autenticacaoService.resetSenhaEmail(resetPasswordBody);  
        if (!canReset) {
            return new ResponseEntity<>("Usuário não encontrado. Faça cadastro", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>("Link para redefinir senha foi enviada para o e-mail.", HttpStatus.OK);
    }

    @GetMapping("/password/reset/confirmEmail")
    public String confirmEmailreset(@RequestParam("token") String uuid, Model model) {
        boolean confirmado = registroService.confirmarResetPassword(uuid);
        if (!confirmado) {
            return "index-error";
        }

        return "index";
    }

    @PostMapping("/password/reset/confirm")
    public ResponseEntity<String> confirmResetPassword(
            @RequestBody @Valid ConfirmPasswordBody confirmPasswordBody) {
        return ResponseEntity.ok(autenticacaoService.confirmarRecuperacaoSenha(confirmPasswordBody));
    }

    @GetMapping("/register/confirm")
    public String confirmUser(@RequestParam("token") String uuid, Model model) {
        boolean userConfirmed = registroService.confirmUser(UUID.fromString(uuid));
        if (!userConfirmed) {
            return "Erro ao validar email";
        }

        return "index";
    }

    private URI buildUserUri(UriComponentsBuilder uriComponentsBuilder, Long userId) {
        return uriComponentsBuilder.path("/api/user/{id}")
                .buildAndExpand(userId).toUri();
    }

    @PostMapping("/email/confirmed")
    public ResponseEntity<String> getUserActive(@RequestBody ResetPasswordBody dto) {
        Boolean status = usuarioService.isUserActive(dto.email());
        Log.info(status.toString());
        return ResponseEntity.ok(dto.email() + ":" + (Boolean.TRUE.equals(status) ? "ACTIVE": "INACTIVE"));
    }
}
