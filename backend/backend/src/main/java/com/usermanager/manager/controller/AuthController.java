package com.usermanager.manager.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
import com.usermanager.manager.infra.service.NotificationService;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.auth.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/api/auth/")
@Slf4j
public class AuthController {
    private static final int COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

    private final AuthService authService;
    private final NotificationService notificationService;

    public AuthController(AuthService authService, NotificationService notificationService) {
        this.authService = authService;
        this.notificationService = notificationService;
    }

    // public AuthController(AuthService authService) {
    //     this.authService = authService;
    // }

    @PostMapping("notification")
    public ResponseEntity<ResponseMessage> sendNotification() {
        notificationService.sendNotificationToAllUsers("Teste", "Olá");
        return ResponseEntity.ok(new ResponseMessage("notificação enviada"));
    }
    @PostMapping("register")
    @ResponseBody
    public ResponseEntity<UserCreatedDTO> createUser(@RequestBody @Valid CreateUserDTO dto) {
        UserCreatedDTO response = authService.register(dto);
        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/users")
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri())
                .body(response);
    }

    @GetMapping("register/confirm")
    public String confirmUser(@RequestParam("token") @NotBlank String token, Model model) {
        boolean validated = authService.confirmVerificationToken(convertStringToUUID(token));
        model.addAttribute("confirmed", validated);
        return "account_confirmed";
    }

    @PostMapping("password/forget")
    @ResponseBody
    public ResponseEntity<ResponseMessage> sendPasswordResetCode(@RequestBody @Valid UserEmailDTO data) {
        boolean response = authService.sendPasswordResetCode(data);
        if (!response)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ResponseMessage("User is not enabled. please confirm the email."));

        return ResponseEntity.ok(new ResponseMessage("Password reset link was sent to your e-mail."));
    }

    @PostMapping("password/reset")
    @ResponseBody
    public ResponseEntity<ResponseMessage> confirmPasswordReset(@RequestBody @Valid PasswordResetWithEmailDTO data) {
        authService.passwordReset(data);

        return ResponseEntity.ok().body(new ResponseMessage("Password changed successfully."));
    }

    @GetMapping("/password/reset/confirmEmail")
    public String confirmEmailreset(@RequestParam("token") String uuid, Model model) {
        boolean confirmed = authService.confirmEmail(convertStringToUUID(uuid));

        model.addAttribute("confirmed", confirmed);
        return "index";
    }

    @PostMapping("login")
    @ResponseBody
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid AuthenticationDTO data,
            HttpServletResponse response, @RequestParam(defaultValue = "MOBILE") ClientType clientType) {
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

    @PostMapping("token/refresh")
    @ResponseBody
    public ResponseEntity<LoginResponseDTO> refreshToken(
            @CookieValue(name = "refreshToken", defaultValue = "") String cookieToken,
            HttpServletResponse response,
            @RequestBody(required = false) RefreshTokenRequest refreshTokenRequest,
            @RequestParam(defaultValue = "MOBILE") ClientType clientType) {

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

    @PostMapping("activate")
    @ResponseBody
    public ResponseEntity<ResponseMessage> activateUser(@RequestBody @Valid ActivateUserDTO data) {
        boolean activationSent = authService.sendActivationCode(data.email());
        if (!activationSent)
            return ResponseEntity.status(409)
                    .body(new ResponseMessage("User is already active with email: " + data.email()));

        return ResponseEntity.ok(new ResponseMessage("Activation link sent to " + data.email() + " successfully."));
    }

    @PostMapping("email/confirmed")
    @ResponseBody
    public ResponseEntity<ResponseMessage> isEmailConfirmed(@RequestBody UserEmailDTO data) {
        var user = authService.findUserByLogin(data.email());
        var verificationToken = authService.findVerificationByUser(user);
        boolean validated = verificationToken.isActivated();
        if (validated) {
            return ResponseEntity.ok(new ResponseMessage("email activated."));
        }

        return ResponseEntity.badRequest().body(new ResponseMessage("email not activated."));
    }

    @GetMapping("token/validate")
    public ResponseEntity<String> validateToken(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok("valid");
    }

    @GetMapping("me")
    @ResponseBody
    public ResponseEntity<ProfileDTO> getUserInfo(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new ProfileDTO(user.getName(), user.getLogin(), user.getCreatedAt(),
                user.getSubscription().getValue()));
    }

    @GetMapping("user/info")
    @ResponseBody
    public ResponseEntity<UserLoginInfo> getUserLoginInfo(@AuthenticationPrincipal User user) {
        String username = capitalize(user.getName().split(" ")[0]);
        return ResponseEntity.ok(
                new UserLoginInfo(username, user.getLastLogin()));
    }

    @GetMapping("cron")
    @ResponseBody
    public ResponseEntity<String> cronJob() {
        log.info("Application is running.");
        return ResponseEntity.ok("Application is working.");
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
            throw new TokenInvalidException("invalid token format.");
        }
    }
}