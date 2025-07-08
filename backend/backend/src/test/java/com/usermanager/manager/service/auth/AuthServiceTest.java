package com.usermanager.manager.service.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.usermanager.manager.dto.authentication.AuthenticationDTO;
import com.usermanager.manager.dto.authentication.CreateUserDTO;
import com.usermanager.manager.dto.authentication.PasswordResetDTO;
import com.usermanager.manager.dto.authentication.PasswordResetWithEmailDTO;
import com.usermanager.manager.dto.authentication.TokensDTO;
import com.usermanager.manager.dto.authentication.UserCreatedDTO;
import com.usermanager.manager.dto.authentication.UserEmailDTO;
import com.usermanager.manager.enums.Status;
import com.usermanager.manager.exception.authentication.PasswordFormatNotValidException;
import com.usermanager.manager.exception.authentication.TokenInvalidException;
import com.usermanager.manager.exception.authentication.TokenNotFoundException;
import com.usermanager.manager.exception.user.UserExistsException;
import com.usermanager.manager.exception.user.UserNotEnabledException;
import com.usermanager.manager.infra.mail.MailService;
import com.usermanager.manager.model.security.RefreshToken;
import com.usermanager.manager.model.security.TokenProvider;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.user.UserRole;
import com.usermanager.manager.model.verification.VerificationToken;
import com.usermanager.manager.model.verification.enums.TokenType;
import com.usermanager.manager.service.subscription.SubscriptionService;
import com.usermanager.manager.service.user.UserService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserService userService;
    @Mock private TokenProvider tokenProvider;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private VerificationTokenService verificationService;
    @Mock private MailService mailService;
    @Mock private RefreshTokenService refreshTokenService;
    @Mock private SubscriptionService subscriptionService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User user;
    private final String testEmail = "test@example.com";
    private final String testPassword = "password";
    private final String encodedPassword = "encodedPassword";

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("Test User")
                .login(testEmail)
                .password(encodedPassword)
                .role(UserRole.ROLE_USER)
                .enabled(true)
                .build();
    }

    // ----------- register -----------
    @Test
    void register_NewUser_Success() {
        CreateUserDTO dto = new CreateUserDTO("Test User", testEmail, testPassword);
        when(userService.findUserEntityByLoginOptional(testEmail)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(testPassword)).thenReturn(encodedPassword);
        when(userService.save(any(User.class))).thenReturn(user);
        VerificationToken token = new VerificationToken();
        token.setUuid(UUID.randomUUID());
        when(verificationService.generateVerificationToken(any(), eq(TokenType.EMAIL_VALIDATION))).thenReturn(token);

        UserCreatedDTO result = authService.register(dto);

        assertEquals(testEmail, result.login());
        verify(mailService).sendVerificationMail(eq(testEmail), anyString());
    }

    @Test
    void register_ExistingUserWithLoginAndEnabled_ThrowsUserExistsException() {
        User existing = User.builder().id(2L).login(testEmail).enabled(true).lastLogin(ZonedDateTime.now()).build();
        CreateUserDTO dto = new CreateUserDTO("Test User", testEmail, testPassword);
        when(userService.findUserEntityByLoginOptional(testEmail)).thenReturn(Optional.of(existing));

        assertThrows(UserExistsException.class, () -> authService.register(dto));
    }

    @Test
    void register_PasswordTooShort_ThrowsPasswordFormatNotValidException() {
        CreateUserDTO dto = new CreateUserDTO("Test User", testEmail, "123");
        when(userService.findUserEntityByLoginOptional(testEmail)).thenReturn(Optional.empty());

        assertThrows(PasswordFormatNotValidException.class, () -> authService.register(dto));
    }

    @Test
    void register_ExistingUserUpdatesData() {
        User existing = User.builder().id(2L).login(testEmail).enabled(false).build();
        CreateUserDTO dto = new CreateUserDTO("New Name", testEmail, testPassword);
        when(userService.findUserEntityByLoginOptional(testEmail)).thenReturn(Optional.of(existing));
        when(passwordEncoder.encode(testPassword)).thenReturn(encodedPassword);
        when(userService.save(any(User.class))).thenReturn(existing);
        VerificationToken token = new VerificationToken();
        token.setUuid(UUID.randomUUID());
        when(verificationService.generateVerificationToken(any(), eq(TokenType.EMAIL_VALIDATION))).thenReturn(token);

        UserCreatedDTO result = authService.register(dto);

        assertEquals(testEmail, result.login());
        verify(mailService).sendVerificationMail(eq(testEmail), anyString());
    }

    // ----------- login -----------
    @Test
    void login_Success() {
        AuthenticationDTO dto = new AuthenticationDTO(testEmail, testPassword);
        Authentication authentication = mock(Authentication.class);

        when(userService.findUserByLogin(testEmail)).thenReturn(user);
        when(passwordEncoder.matches(testPassword, encodedPassword)).thenReturn(true);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(tokenProvider.generateToken(user)).thenReturn("accessToken");
        when(refreshTokenService.createRefreshToken(user)).thenReturn("refreshToken");
        when(userService.save(any(User.class))).thenReturn(user);

        TokensDTO result = authService.login(dto);

        assertEquals("accessToken", result.accessToken());
        assertEquals("refreshToken", result.refreshToken());
    }

    @Test
    void login_UserNotEnabled_ThrowsException() {
        user.setEnabled(false);
        when(userService.findUserByLogin(testEmail)).thenReturn(user);

        assertThrows(UserNotEnabledException.class, () -> authService.login(new AuthenticationDTO(testEmail, testPassword)));
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        when(userService.findUserByLogin(testEmail)).thenReturn(user);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(new AuthenticationDTO(testEmail, testPassword)));
    }

    // ----------- refreshToken -----------
    @Test
    void refreshToken_ValidToken_Success() {
        String oldToken = "oldToken";
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        when(refreshTokenService.findByToken(oldToken)).thenReturn(refreshToken);
        when(tokenProvider.generateToken(user)).thenReturn("accessToken");
        when(refreshTokenService.createRefreshToken(user)).thenReturn("newRefreshToken");

        TokensDTO result = authService.refreshToken(oldToken);

        assertEquals("accessToken", result.accessToken());
        assertEquals("newRefreshToken", result.refreshToken());
        verify(refreshTokenService).invalidateToken(oldToken);
    }

    @Test
    void refreshToken_TokenNotFound_ThrowsException() {
        when(refreshTokenService.findByToken("invalid")).thenThrow(new TokenNotFoundException("not found"));
        assertThrows(TokenNotFoundException.class, () -> authService.refreshToken("invalid"));
    }

    @Test
    void refreshToken_TokenInvalid_ThrowsException() {
        when(refreshTokenService.findByToken("expired")).thenThrow(new TokenInvalidException("expired"));
        assertThrows(TokenInvalidException.class, () -> authService.refreshToken("expired"));
    }

    // ----------- sendActivationCode -----------
    @Test
    void sendActivationCode_UserNotEnabled_SendsMail() {
        user.setEnabled(false);
        when(userService.findUserByLogin(testEmail)).thenReturn(user);
        VerificationToken token = new VerificationToken();
        token.setUuid(UUID.randomUUID());
        when(verificationService.generateVerificationToken(user, TokenType.EMAIL_VALIDATION)).thenReturn(token);

        boolean result = authService.sendActivationCode(testEmail);

        assertTrue(result);
        verify(mailService).sendVerificationMail(eq(testEmail), anyString());
    }

    @Test
    void sendActivationCode_UserEnabled_ReturnsFalse() {
        user.setEnabled(true);
        when(userService.findUserByLogin(testEmail)).thenReturn(user);

        boolean result = authService.sendActivationCode(testEmail);

        assertFalse(result);
        verify(mailService, never()).sendVerificationMail(anyString(), anyString());
    }

    // ----------- sendPasswordResetCode -----------
    @Test
    void sendPasswordResetCode_UserEnabled_SendsMail() {
        user.setEnabled(true);
        when(userService.findUserByLoginOptional(testEmail)).thenReturn(Optional.of(user));
        VerificationToken token = new VerificationToken();
        token.setUuid(UUID.randomUUID());
        when(verificationService.generateVerificationToken(user, TokenType.RESET_PASSWORD)).thenReturn(token);

        boolean result = authService.sendPasswordResetCode(new UserEmailDTO(testEmail));

        assertTrue(result);
        verify(mailService).sendResetPasswordEmail(eq(testEmail), anyString());
    }

    @Test
    void sendPasswordResetCode_UserNotFound_ReturnsFalse() {
        when(userService.findUserByLoginOptional(testEmail)).thenReturn(Optional.empty());
        boolean result = authService.sendPasswordResetCode(new UserEmailDTO(testEmail));
        assertFalse(result);
    }

    @Test
    void sendPasswordResetCode_UserNotEnabled_ReturnsFalse() {
        user.setEnabled(false);
        when(userService.findUserByLoginOptional(testEmail)).thenReturn(Optional.of(user));
        boolean result = authService.sendPasswordResetCode(new UserEmailDTO(testEmail));
        assertFalse(result);
    }

    // ----------- passwordReset (token) -----------
    @Test
    void passwordReset_WithToken_UpdatesPasswordAndToken() {
        UUID uuid = UUID.randomUUID();
        PasswordResetDTO dto = new PasswordResetDTO("newPass");
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(user);

        when(verificationService.findVerificationByToken(uuid)).thenReturn(verificationToken);
        when(passwordEncoder.encode("newPass")).thenReturn("encodedNewPass");

        authService.passwordReset(uuid, dto);

        assertEquals("encodedNewPass", user.getPassword());
        assertTrue(verificationToken.isActivated());
        assertNotNull(verificationToken.getActivationDate());
        verify(userService).save(user);
        verify(verificationService).saveVerificationToken(verificationToken);
    }

    // ----------- confirmEmail -----------
    @Test
    void confirmEmail_ValidToken_EnablesUserAndToken() {
        UUID uuid = UUID.randomUUID();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(user);

        when(verificationService.findByIdOrElseNull(uuid)).thenReturn(verificationToken);

        boolean result = authService.confirmEmail(uuid);

        assertTrue(result);
        assertTrue(user.isEnabled());
        assertEquals(Status.ACTIVE, user.getStatus());
        assertTrue(verificationToken.isActivated());
        assertNotNull(verificationToken.getActivationDate());
        verify(userService).save(user);
        verify(verificationService).saveVerificationToken(verificationToken);
    }

    @Test
    void confirmEmail_InvalidToken_ReturnsFalse() {
        UUID uuid = UUID.randomUUID();
        when(verificationService.findByIdOrElseNull(uuid)).thenReturn(null);

        boolean result = authService.confirmEmail(uuid);

        assertFalse(result);
        verify(userService, never()).save(any());
        verify(verificationService, never()).saveVerificationToken(any());
    }

    // ----------- passwordReset (email) -----------
    @Test
    void passwordReset_WithEmail_UpdatesUserAndToken() {
        PasswordResetWithEmailDTO dto = new PasswordResetWithEmailDTO(testEmail, "newPass");
        VerificationToken verificationToken = new VerificationToken();
        when(userService.findUserByLogin(testEmail)).thenReturn(user);
        when(verificationService.findVerificationByUser(user)).thenReturn(verificationToken);
        when(passwordEncoder.encode("newPass")).thenReturn("encodedNewPass");

        authService.passwordReset(dto);

        assertTrue(user.isEnabled());
        assertEquals("encodedNewPass", user.getPassword());
        assertTrue(verificationToken.isActivated());
        assertNotNull(verificationToken.getActivationDate());
        verify(userService, atLeastOnce()).save(user);
        verify(verificationService).saveVerificationToken(verificationToken);
    }

    // ----------- isEmailConfirmed -----------
    @Test
    void isEmailConfirmed_ReturnsTrueIfEnabled() {
        when(userService.findUserByLogin(testEmail)).thenReturn(user);
        assertTrue(authService.isEmailConfirmed(new UserEmailDTO(testEmail)));
    }

    @Test
    void isEmailConfirmed_ReturnsFalseIfNotEnabled() {
        user.setEnabled(false);
        when(userService.findUserByLogin(testEmail)).thenReturn(user);
        assertFalse(authService.isEmailConfirmed(new UserEmailDTO(testEmail)));
    }

    // ----------- findUserByLogin -----------
    @Test
    void findUserByLogin_DelegatesToUserService() {
        when(userService.findUserByLogin(testEmail)).thenReturn(user);
        assertEquals(user, authService.findUserByLogin(testEmail));
    }

    // ----------- confirmVerificationToken -----------
    @Test
    void confirmVerificationToken_DelegatesToVerificationService() {
        UUID uuid = UUID.randomUUID();
        when(verificationService.confirmVerificationToken(uuid)).thenReturn(true);
        assertTrue(authService.confirmVerificationToken(uuid));
    }

    // ----------- findVerificationByUser -----------
    @Test
    void findVerificationByUser_DelegatesToVerificationService() {
        VerificationToken token = new VerificationToken();
        when(verificationService.findVerificationByUser(user)).thenReturn(token);
        assertEquals(token, authService.findVerificationByUser(user));
    }

    // ----------- getExpirationDate -----------
    @Test
    void getExpirationDate_DelegatesToSubscriptionService() {
        ZonedDateTime date = ZonedDateTime.now();
        when(subscriptionService.getExpirationDate(user)).thenReturn(date);
        assertEquals(date, authService.getExpirationDate(user));
    }
}