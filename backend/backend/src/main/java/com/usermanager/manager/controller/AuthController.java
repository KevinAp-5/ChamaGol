package com.usermanager.manager.controller;

import java.time.ZonedDateTime;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.UriComponentsBuilder;

import com.usermanager.manager.dto.authentication.ActivateUserDTO;
import com.usermanager.manager.dto.authentication.AuthenticationDTO;
import com.usermanager.manager.dto.authentication.CreateUserDTO;
import com.usermanager.manager.dto.authentication.LoginResponseDTO;
import com.usermanager.manager.dto.authentication.PasswordResetWithEmailDTO;
import com.usermanager.manager.dto.authentication.RefreshTokenRequest;
import com.usermanager.manager.dto.authentication.TokensDTO;
import com.usermanager.manager.dto.authentication.UserCreatedDTO;
import com.usermanager.manager.dto.authentication.UserEmailDTO;
import com.usermanager.manager.dto.common.ResponseMessage;
import com.usermanager.manager.dto.user.ProfileDTO;
import com.usermanager.manager.dto.user.UserLoginInfo;
import com.usermanager.manager.enums.ClientType;
import com.usermanager.manager.exception.authentication.TokenInvalidException;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.auth.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Autenticação", description = "Endpoints de autenticação, registro e gerenciamento de usuários")
@Controller
@RequestMapping("/api/auth/")
@Slf4j
public class AuthController {
    private static final int COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("teste/updateAllAlerts")
    public ResponseEntity<ResponseMessage> testeUpdateAllAlerts() {
        authService.updateAllAlerts();
        return ResponseEntity.ok(new ResponseMessage("ok"));
    }

    @GetMapping("teste/cleanExpiredSubscriptions")
    public ResponseEntity<ResponseMessage> testeCleanExpiredSubscriptions() {
        authService.cleanExpiredSubscriptions();
        return ResponseEntity.ok(new ResponseMessage("ok"));
    }

    @Operation(summary = "Enviar notificação de teste para todos os usuários")
    @ApiResponse(responseCode = "200", description = "Notificação enviada")
    @PostMapping("notification")
    public ResponseEntity<ResponseMessage> sendNotification() {
        authService.getNotificationService().sendNotificationToAllUsers("Teste", "Olá");
        return ResponseEntity.ok(new ResponseMessage("notificação enviada"));
    }

    @Operation(summary = "Registrar novo usuário", description = "Cria um novo usuário e envia e-mail de confirmação.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso"),
            @ApiResponse(responseCode = "409", description = "Usuário já existe")
    })
    @PostMapping("register")
    @ResponseBody
    public ResponseEntity<UserCreatedDTO> createUser(
            @RequestBody(description = "Dados para registro de usuário", required = true, content = @Content(schema = @Schema(implementation = CreateUserDTO.class))) @org.springframework.web.bind.annotation.RequestBody @Valid CreateUserDTO dto) {
        UserCreatedDTO response = authService.register(dto);
        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/users")
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri())
                .body(response);
    }

    @Operation(summary = "Confirmar registro de usuário via token", description = "Confirma o registro do usuário através do token enviado por e-mail.")
    @ApiResponse(responseCode = "200", description = "Conta confirmada (HTML)")
    @GetMapping("register/confirm")
    public String confirmUser(
            @Parameter(description = "Token de confirmação enviado por e-mail", required = true) @RequestParam("token") @NotBlank String token,
            Model model) {
        log.info("token: {}", token);
        boolean validated = authService.confirmVerificationToken(convertStringToUUID(token));
        model.addAttribute("confirmed", validated);
        return "account_confirmed";
    }

    @Operation(summary = "Solicitar redefinição de senha", description = "Envia um e-mail para redefinição de senha.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "E-mail enviado com sucesso"),
            @ApiResponse(responseCode = "409", description = "Usuário não habilitado")
    })
    @PostMapping("password/forget")
    @ResponseBody
    public ResponseEntity<ResponseMessage> sendPasswordResetCode(
            @RequestBody(description = "E-mail do usuário", required = true, content = @Content(schema = @Schema(implementation = UserEmailDTO.class))) @org.springframework.web.bind.annotation.RequestBody @Valid UserEmailDTO data) {
        boolean response = authService.sendPasswordResetCode(data);
        if (!response)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ResponseMessage(
                            "Usuário não está habilitado. Por favor, confirme o e-mail após o cadastro."));

        return ResponseEntity.ok(new ResponseMessage("Link para redefinição de senha enviado para seu e-mail."));
    }

    @Operation(summary = "Confirmar redefinição de senha", description = "Confirma a redefinição de senha do usuário.")
    @ApiResponse(responseCode = "200", description = "Senha alterada com sucesso")
    @PostMapping("password/reset")
    @ResponseBody
    public ResponseEntity<ResponseMessage> confirmPasswordReset(
            @RequestBody(description = "Dados para redefinição de senha", required = true, content = @Content(schema = @Schema(implementation = PasswordResetWithEmailDTO.class))) @org.springframework.web.bind.annotation.RequestBody @Valid PasswordResetWithEmailDTO data) {
        authService.passwordReset(data);
        return ResponseEntity.ok().body(new ResponseMessage("Senha alterada com sucesso."));
    }

    @Operation(summary = "Confirmar e-mail para redefinição de senha", description = "Confirma o e-mail do usuário para redefinição de senha (HTML).")
    @ApiResponse(responseCode = "200", description = "E-mail confirmado (HTML)")
    @GetMapping("/password/reset/confirmEmail")
    public String confirmEmailreset(
            @Parameter(description = "Token de confirmação enviado por e-mail", required = true) @RequestParam("token") String uuid,
            Model model) {
        boolean confirmed = authService.confirmEmail(convertStringToUUID(uuid));
        model.addAttribute("confirmed", confirmed);
        return "index";
    }

    @Operation(summary = "Login do usuário", description = "Autentica o usuário e retorna tokens de acesso.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    })
    @PostMapping("login")
    @ResponseBody
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody(description = "Dados de autenticação", required = true, content = @Content(schema = @Schema(implementation = AuthenticationDTO.class))) @org.springframework.web.bind.annotation.RequestBody @Valid AuthenticationDTO data,
            HttpServletResponse response,
            @Parameter(description = "Tipo de cliente (MOBILE ou WEB)", example = "MOBILE") @RequestParam(defaultValue = "MOBILE") ClientType clientType) {
        TokensDTO tokens = authService.login(data);
        if (clientType == ClientType.WEB) {
            response.addCookie(createCookie("refreshToken", tokens.refreshToken()));
        }
        LoginResponseDTO responseDTO = new LoginResponseDTO(tokens.accessToken());
        if (clientType == ClientType.MOBILE) {
            responseDTO.setRefreshToken(tokens.refreshToken());
        }
        return ResponseEntity.ok().body(responseDTO);
    }

    @Operation(summary = "Renovar token de acesso", description = "Gera um novo token de acesso a partir do refresh token.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token renovado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Refresh token ausente ou inválido")
    })
    @PostMapping("token/refresh")
    @ResponseBody
    public ResponseEntity<LoginResponseDTO> refreshToken(
            @Parameter(description = "Refresh token do cookie", required = false) @CookieValue(name = "refreshToken", defaultValue = "") String cookieToken,
            HttpServletResponse response,
            @RequestBody(description = "Refresh token no corpo da requisição (opcional para MOBILE)", required = false, content = @Content(schema = @Schema(implementation = RefreshTokenRequest.class))) @org.springframework.web.bind.annotation.RequestBody(required = false) RefreshTokenRequest refreshTokenRequest,
            @Parameter(description = "Tipo de cliente (MOBILE ou WEB)", example = "MOBILE") @RequestParam(defaultValue = "MOBILE") ClientType clientType) {

        String refreshToken = cookieToken;

        if ((refreshToken == null || refreshToken.isBlank()) && refreshTokenRequest != null) {
            refreshToken = refreshTokenRequest.token();
        }

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponseDTO("Refresh token is missing."));
        }

        TokensDTO newTokens = authService.refreshToken(refreshToken);

        // Atualiza o cookie apenas para clientes WEB
        if (clientType == ClientType.WEB) {
            response.addCookie(createCookie("refreshToken", newTokens.refreshToken()));
        }

        LoginResponseDTO responseDTO = new LoginResponseDTO(newTokens.accessToken());

        // Inclui refresh token no payload apenas para clientes MOBILE
        if (clientType == ClientType.MOBILE) {
            responseDTO.setRefreshToken(newTokens.refreshToken());
        }

        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "Enviar código de ativação", description = "Envia um código de ativação para o e-mail do usuário.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Código enviado com sucesso"),
            @ApiResponse(responseCode = "409", description = "Usuário já ativo")
    })
    @PostMapping("activate")
    @ResponseBody
    public ResponseEntity<ResponseMessage> activateUser(
            @RequestBody(description = "Dados para ativação de usuário", required = true, content = @Content(schema = @Schema(implementation = ActivateUserDTO.class))) @org.springframework.web.bind.annotation.RequestBody @Valid ActivateUserDTO data) {
        boolean activationSent = authService.sendActivationCode(data.email());
        if (!activationSent)
            return ResponseEntity.status(409)
                    .body(new ResponseMessage("Usuário já está ativo com o e-mail: " + data.email()));

        return ResponseEntity
                .ok(new ResponseMessage("Link de ativação enviado para " + data.email() + " com sucesso."));
    }

    @Operation(summary = "Verificar se e-mail está confirmado", description = "Verifica se o e-mail do usuário foi confirmado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "E-mail ativado"),
            @ApiResponse(responseCode = "400", description = "E-mail não ativado")
    })
    @PostMapping("email/confirmed")
    @ResponseBody
    public ResponseEntity<ResponseMessage> isEmailConfirmed(
            @RequestBody(description = "E-mail do usuário", required = true, content = @Content(schema = @Schema(implementation = UserEmailDTO.class))) @org.springframework.web.bind.annotation.RequestBody UserEmailDTO data) {
        var user = authService.findUserByLogin(data.email());
        var verificationToken = authService.findVerificationByUser(user);
        boolean validated = verificationToken.isActivated();
        if (validated) {
            return ResponseEntity.ok(new ResponseMessage("E-mail ativado."));
        }

        return ResponseEntity.badRequest().body(new ResponseMessage("E-mail não ativado."));
    }

    @Operation(summary = "Validar token de acesso", description = "Valida o token de acesso do usuário autenticado.")
    @ApiResponse(responseCode = "200", description = "Token válido")
    @GetMapping("token/validate")
    public ResponseEntity<String> validateToken(
            @Parameter(description = "Usuário autenticado") @AuthenticationPrincipal User user) {
        return ResponseEntity.ok("válido");
    }

    @Operation(summary = "Obter informações do usuário autenticado")
    @ApiResponse(responseCode = "200", description = "Informações do perfil do usuário")
    @GetMapping("me")
    @ResponseBody
    public ResponseEntity<ProfileDTO> getUserInfo(
            @Parameter(description = "Usuário autenticado") @AuthenticationPrincipal User user) {
        log.info("User: {}", user);
        ZonedDateTime expirationDate = authService.getExpirationDate(user);
        return ResponseEntity.ok(new ProfileDTO(user.getName(), user.getLogin(), user.getCreatedAt(),
                user.getSubscription().getValue(), expirationDate));
    }

    @Operation(summary = "Obter informações de login do usuário autenticado")
    @ApiResponse(responseCode = "200", description = "Informações de login do usuário")
    @GetMapping("user/info")
    @ResponseBody
    public ResponseEntity<UserLoginInfo> getUserLoginInfo(
            @Parameter(description = "Usuário autenticado") @AuthenticationPrincipal User user) {
        String username = capitalize(user.getName().split(" ")[0]);
        return ResponseEntity.ok(
                new UserLoginInfo(username, user.getLastLogin()));
    }

    @Operation(summary = "Verificar status da aplicação", description = "Endpoint para health check.")
    @ApiResponse(responseCode = "200", description = "Aplicação está rodando")
    @GetMapping("cron")
    @ResponseBody
    public ResponseEntity<String> cronJob() {
        log.info("Application is running.");
        return ResponseEntity.ok("Aplicação está funcionando.");
    }

    private Cookie createCookie(String name, String value) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setAttribute("SameSite", "Strict");
        cookie.setMaxAge(COOKIE_MAX_AGE);
        return cookie;
    }

    private static String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private UUID convertStringToUUID(String token) {
        try {
            return UUID.fromString(token);
        } catch (IllegalArgumentException e) {
            throw new TokenInvalidException("formato de token inválido.");
        }
    }
}