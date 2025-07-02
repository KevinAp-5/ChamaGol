package com.usermanager.manager.service.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.usermanager.manager.dto.authentication.AuthenticationDTO;
import com.usermanager.manager.dto.authentication.CreateUserDTO;
import com.usermanager.manager.dto.authentication.PasswordResetDTO;
import com.usermanager.manager.dto.authentication.TokensDTO;
import com.usermanager.manager.dto.authentication.UserCreatedDTO;
import com.usermanager.manager.dto.authentication.UserEmailDTO;
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
import com.usermanager.manager.service.user.UserService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UserService userService;

    @Mock
    private TokenProvider tokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private VerificationTokenService verificationService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private MailService mailService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    private User user;
    private AuthenticationDTO authenticationDTO;
    private final String testEmail = "test@example.com";
    private final String testPassword = "password";
    private final String encodedPassword = "encodedPassword";
    private final String testToken = "testToken";

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("Test User")
                .login(testEmail)
                .password(encodedPassword)
                .role(UserRole.USER)
                .enabled(true)
                .build();

        authenticationDTO = new AuthenticationDTO(testEmail, testPassword);
    }

    @Test
    void register_Successful_ReturnsUserCreatedDTO() {
        CreateUserDTO createUserDTO = new CreateUserDTO("Test User", testEmail, testPassword);
        User savedUser = User.builder()
                .id(1L)
                .name("Test User")
                .login(testEmail)
                .password(encodedPassword)
                .role(UserRole.USER)
                .enabled(false)
                .build();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUuid(UUID.randomUUID());

        // Simula usuário não existente
        when(userService.findUserEntityByLoginOptional(testEmail)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(testPassword)).thenReturn(encodedPassword);
        when(userService.save(any(User.class))).thenReturn(savedUser);
        when(verificationService.generateVerificationToken(savedUser, TokenType.EMAIL_VALIDATION)).thenReturn(verificationToken);

        UserCreatedDTO result = authService.register(createUserDTO);

        assertNotNull(result);
        assertEquals(savedUser.getLogin(), result.login());
        verify(userService).findUserEntityByLoginOptional(testEmail);
        verify(passwordEncoder).encode(testPassword);
        verify(userService).save(any(User.class));
        verify(verificationService).generateVerificationToken(savedUser, TokenType.EMAIL_VALIDATION);
        verify(mailService).sendVerificationMail(eq(savedUser.getLogin()), anyString());
    }

    @Test
    void register_UserAlreadyExists_ThrowsUserExistsException() {
        CreateUserDTO createUserDTO = new CreateUserDTO("Test User", testEmail, testPassword);

        // Simula usuário já existente, habilitado e sem lastLogin
        User existingUser = User.builder()
                .id(1L)
                .name("Test User")
                .login(testEmail)
                .password(encodedPassword)
                .role(UserRole.USER)
                .enabled(true)
                .lastLogin(null)
                .build();

        when(userService.findUserEntityByLoginOptional(testEmail)).thenReturn(Optional.of(existingUser));

        assertThrows(UserExistsException.class, () -> authService.register(createUserDTO));
        verify(userService).findUserEntityByLoginOptional(testEmail);
        verifyNoInteractions(passwordEncoder, verificationService, mailService);
    }

    @Test
    void register_PasswordTooShort_ThrowsPasswordFormatNotValidException() {
        CreateUserDTO createUserDTO = new CreateUserDTO("Test User", testEmail, "123");

        // Simula usuário não existente
        when(userService.findUserEntityByLoginOptional(testEmail)).thenReturn(Optional.empty());

        assertThrows(PasswordFormatNotValidException.class, () -> authService.register(createUserDTO));
        verify(userService).findUserEntityByLoginOptional(testEmail);
        verifyNoInteractions(passwordEncoder, verificationService, mailService);
    }

    @Test
    void loadUserByUsername_UserExists_ReturnsUserDetails() {
        when(userService.findUserByLoginOptional("test@example.com")).thenReturn(Optional.of(user));

        UserDetails result = authService.loadUserByUsername(testEmail);

        assertEquals(user, result);
    }

    @Test
    void loadUserByUsername_UserNotFound_ThrowsException() {
        when(userService.findUserByLoginOptional("test@example.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.loadUserByUsername("test@example.com"));
    }

    @Test
    void Login_Successful_ReturnsToken() {
        Authentication authentication = mock(Authentication.class);

        when(userService.findUserByLogin(authenticationDTO.login())).thenReturn(user);
        when(passwordEncoder.matches(testPassword, encodedPassword)).thenReturn(true);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(tokenProvider.generateToken(user)).thenReturn(testToken);
        when(refreshTokenService.createRefreshToken(user)).thenReturn("refreshToken");

        TokensDTO result = authService.login(authenticationDTO);
        assertEquals(testToken, result.accessToken());
        assertEquals("refreshToken", result.refreshToken());
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void Login_UserNotEnabled_ThrowsException() {
        user.setEnabled(false);
        when(userService.findUserByLogin(authenticationDTO.login())).thenReturn(user);

        assertThrows(UserNotEnabledException.class, () -> authService.login(authenticationDTO));
    }

    @Test
    void Login_InvalidPassword_ThrowsException() {
        when(userService.findUserByLogin(authenticationDTO.login())).thenReturn(user);
        when(passwordEncoder.matches(authenticationDTO.password(), user.getPassword())).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(authenticationDTO));
    }

    @Test
    void sendActivationCode_Sucessfull_SendsEmail() {
        user.setEnabled(false);
        when(userService.findUserByLogin(authenticationDTO.login())).thenReturn(user);
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUuid(UUID.randomUUID());

        when(verificationService.generateVerificationToken(user, TokenType.EMAIL_VALIDATION))
                .thenReturn(verificationToken);

        boolean result = authService.sendActivationCode(user.getLogin());

        assertTrue(result);
        verify(mailService).sendVerificationMail(eq(user.getLogin()), anyString());
    }

    @Test
    void sendActivationCode_Userenabled_ReturnsFalse() {
        user.setEnabled(true);
        when(userService.findUserByLogin(testEmail)).thenReturn(user);

        boolean result = authService.sendActivationCode(testEmail);

        assertFalse(result);
        verifyNoInteractions(verificationService, mailService);
    }

    @Test
    void sendPasswordResetCode_Success_SendsEmail() {
        user.setEnabled(true);

        VerificationToken verificationToken = new VerificationToken();
        UUID uuid = UUID.randomUUID();
        verificationToken.setUuid(uuid);

        when(userService.findUserByLogin(testEmail)).thenReturn(user);
        when(verificationService.generateVerificationToken(user, TokenType.RESET_PASSWORD))
                .thenReturn(verificationToken);

        boolean result = authService.sendPasswordResetCode(new UserEmailDTO(testEmail));

        assertTrue(result);
        verify(mailService).sendResetPasswordEmail(eq(user.getLogin()), anyString());
    }

    @Test
    void sendPasswordResetCode_UserNotEnabled_ReturnsFalse() {
        user.setEnabled(false);
        when(userService.findUserByLogin(testEmail)).thenReturn(user);

        boolean result = authService.sendPasswordResetCode(new UserEmailDTO(testEmail));

        assertFalse(result);
        verifyNoInteractions(verificationService, mailService);
    }

    @Test
    void passwordReset_ValidToken_UpdatesPasswordAndToken() {
        UUID testUUID = UUID.randomUUID();
        PasswordResetDTO dto = new PasswordResetDTO("newPassword");
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(user);

        when(verificationService.findVerificationByToken(testUUID)).thenReturn(verificationToken);
        when(passwordEncoder.encode(dto.newPassword())).thenReturn("newEncodedPassword");

        authService.passwordReset(testUUID, dto);

        // Verify password update
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userService).save(userCaptor.capture());
        assertEquals("newEncodedPassword", userCaptor.getValue().getPassword());

        // Verify token update
        ArgumentCaptor<VerificationToken> tokenCaptor = ArgumentCaptor.forClass(VerificationToken.class);
        verify(verificationService).saveVerificationToken(tokenCaptor.capture());
        assertTrue(tokenCaptor.getValue().isActivated());
        assertNotNull(tokenCaptor.getValue().getActivationDate());
    }

    @Test
    void refreshToken_ShouldReturnNewTokens_WhenRefreshTokenIsValid() {
        String oldRefreshToken = "oldRefreshToken";
        String newAccessToken = "newAccessToken";
        String newRefreshToken = "newRefreshToken";

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(oldRefreshToken);
        refreshToken.setUser(user);

        when(refreshTokenService.findByToken(oldRefreshToken)).thenReturn(refreshToken);
        when(tokenProvider.generateToken(user)).thenReturn(newAccessToken);
        when(refreshTokenService.createRefreshToken(user)).thenReturn(newRefreshToken);

        TokensDTO result = authService.refreshToken(oldRefreshToken);

        assertEquals(newAccessToken, result.accessToken());
        assertEquals(newRefreshToken, result.refreshToken());
        verify(refreshTokenService).invalidateToken(oldRefreshToken);
    }

    @Test
    void refreshToken_ShouldThrowException_WhenRefreshTokenNotFound() {
        String invalidToken = "invalidToken";

        when(refreshTokenService.findByToken(invalidToken))
                .thenThrow(new TokenNotFoundException("Refresh Token not found"));

        assertThrows(TokenNotFoundException.class, () -> authService.refreshToken(invalidToken));
        verify(refreshTokenService, never()).invalidateToken(anyString());
    }

    @Test
    void refreshToken_ShouldThrowException_WhenRefreshTokenIsExpired() {
        String expiredToken = "expiredToken";

        // Simula o comportamento do método findByToken lançando TokenInvalidException
        when(refreshTokenService.findByToken(expiredToken))
                .thenThrow(new TokenInvalidException("Refresh Token expired"));

        // Verifica se a exceção é lançada ao chamar o método refreshToken
        assertThrows(TokenInvalidException.class, () -> authService.refreshToken(expiredToken));

        // Garante que o método invalidateToken nunca é chamado
        verify(refreshTokenService, never()).invalidateToken(anyString());
    }

    @Test
    void refreshToken_ShouldThrowException_WhenRefreshTokenIsAlreadyUsed() {
        String usedToken = "usedToken";

        // Simula o comportamento do método findByToken lançando TokenInvalidException
        when(refreshTokenService.findByToken(usedToken))
                .thenThrow(new TokenInvalidException("Refresh Token already used"));

        // Verifica se a exceção é lançada ao chamar o método refreshToken
        assertThrows(TokenInvalidException.class, () -> authService.refreshToken(usedToken));

        // Garante que o método invalidateToken nunca é chamado
        verify(refreshTokenService, never()).invalidateToken(anyString());
    }
}
