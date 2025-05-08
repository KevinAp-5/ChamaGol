package com.usermanager.manager.service.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.usermanager.manager.exception.authentication.TokenInvalid;
import com.usermanager.manager.exception.authentication.TokenInvalidException;
import com.usermanager.manager.exception.authentication.TokenNotFoundException;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.verification.VerificationToken;
import com.usermanager.manager.model.verification.enums.TokenType;
import com.usermanager.manager.repository.UserRepository;
import com.usermanager.manager.repository.VerificationTokenRepository;

@ExtendWith(MockitoExtension.class)
class VerificationTokenServiceTest {
    @Mock
    private VerificationTokenRepository verificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VerificationTokenService verificationTokenService;

    private User testUser;
    private VerificationToken validToken;
    private VerificationToken expiredToken;
    private final UUID validTokenString = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private final UUID expiredTokenString = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEnabled(false);

        validToken = VerificationToken.builder()
                .uuid(validTokenString)
                .user(testUser)
                .creationDate(ZonedDateTime.now().minusHours(1).toInstant())
                .expirationDate(ZonedDateTime.now().plusHours(23).toInstant())
                .tokenType(TokenType.EMAIL_VALIDATION)
                .activated(false)
                .build();

        expiredToken = VerificationToken.builder()
                .uuid(expiredTokenString)
                .user(testUser)
                .creationDate(ZonedDateTime.now().minusDays(2).toInstant())
                .expirationDate(ZonedDateTime.now().minusDays(1).toInstant())
                .tokenType(TokenType.RESET_PASSWORD)
                .activated(false)
                .build();
    }

    @Test
    void generateVerificationToken_ValidInput_ReturnsSavedToken() {
        when(verificationRepository.save(any(VerificationToken.class))).thenReturn(validToken);

        VerificationToken result = verificationTokenService.generateVerificationToken(testUser,
                TokenType.EMAIL_VALIDATION);

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals(TokenType.EMAIL_VALIDATION, result.getTokenType());
        assertTrue(result.getExpirationDate().isAfter(result.getCreationDate()));
        verify(verificationRepository).save(any(VerificationToken.class));
    }

    @Test
    void confirmVerificationToken_ValidToken_ActivatesUserAndToken() {
        when(verificationRepository.findById(any(UUID.class))).thenReturn(Optional.of(validToken));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        boolean result = verificationTokenService.confirmVerificationToken(validTokenString);

        assertTrue(result);
        assertTrue(testUser.getEnabled());

        ArgumentCaptor<VerificationToken> verificationCaptor = ArgumentCaptor.forClass(VerificationToken.class);
        verify(verificationRepository).save(verificationCaptor.capture());

        VerificationToken savedToken = verificationCaptor.getValue();
        assertTrue(savedToken.isActivated());
        assertNotNull(savedToken.getActivationDate());
    }

    @Test
    void confirmVerificationToken_TokenNotFound_ThrowsException() {
        // Arrange
        when(verificationRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(TokenNotFoundException.class, () -> {
            verificationTokenService.confirmVerificationToken(expiredTokenString);
        });
    }

    @Test
    void confirmVerificationToken_ExpiredToken_ThrowsException() {
        // Arrange
        when(verificationRepository.findById(any(UUID.class))).thenReturn(Optional.of(expiredToken));

        // Act & Assert
        assertThrows(TokenInvalid.class, () -> {
            verificationTokenService.confirmVerificationToken(expiredTokenString);
        });
    }

    @Test
    void findVerificationByToken_ValidToken_ReturnsToken() {
        when(verificationRepository.findById(validTokenString)).thenReturn(Optional.of(validToken));

        VerificationToken result = verificationTokenService.findVerificationByToken(validTokenString);

        assertNotNull(result);
        assertEquals(result.getUuid(), validTokenString);
    }

    @Test
    void findVerificationByToken_TokenNotFound_ThrowsException() {
        when(verificationRepository.findById(expiredTokenString)).thenReturn(Optional.empty());

        assertThrows(TokenNotFoundException.class,
                () -> verificationTokenService.findVerificationByToken(expiredTokenString));
    }

    @Test
    void findVerificationByToken_ExpiredToken_ThrowsException() {
        when(verificationRepository.findById(expiredTokenString)).thenReturn(Optional.of(expiredToken));

        assertThrows(TokenInvalidException.class,
                () -> verificationTokenService.findVerificationByToken(expiredTokenString));
    }

    @Test
    void saveVerificationToken_ValidToken_SavesToRepository() {
        VerificationToken verificationToken = new VerificationToken();

        verificationTokenService.saveVerificationToken(verificationToken);

        verify(verificationRepository).save(verificationToken);
    }
}
