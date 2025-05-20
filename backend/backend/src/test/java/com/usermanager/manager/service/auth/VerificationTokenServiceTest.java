package com.usermanager.manager.service.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    @SuppressWarnings("unused")
    private VerificationToken activatedToken;
    private final UUID validTokenUuid = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private final UUID expiredTokenUuid = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
    private final UUID activatedTokenUuid = UUID.fromString("550e8400-e29b-41d4-a716-446655440002");

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setLogin("testuser");
        testUser.setEnabled(false);

        validToken = VerificationToken.builder()
                .uuid(validTokenUuid)
                .user(testUser)
                .creationDate(ZonedDateTime.now().minusHours(1).toInstant())
                .expirationDate(ZonedDateTime.now().plusHours(23).toInstant())
                .tokenType(TokenType.EMAIL_VALIDATION)
                .activated(false)
                .build();

        expiredToken = VerificationToken.builder()
                .uuid(expiredTokenUuid)
                .user(testUser)
                .creationDate(ZonedDateTime.now().minusDays(2).toInstant())
                .expirationDate(ZonedDateTime.now().minusDays(1).toInstant())
                .tokenType(TokenType.RESET_PASSWORD)
                .activated(false)
                .build();

        activatedToken = VerificationToken.builder()
                .uuid(activatedTokenUuid)
                .user(testUser)
                .creationDate(ZonedDateTime.now().minusHours(2).toInstant())
                .expirationDate(ZonedDateTime.now().plusHours(22).toInstant())
                .tokenType(TokenType.RESET_PASSWORD)
                .activated(true)
                .activationDate(ZonedDateTime.now().minusHours(1).toInstant())
                .build();
    }

    @Nested
    @DisplayName("Generate Verification Token Tests")
    class GenerateVerificationTokenTests {

        @Test
        @DisplayName("Should generate and save a valid email verification token")
        void generateVerificationToken_WithValidUser_EmailValidation_ReturnsSavedToken() {
            // Arrange
            when(verificationRepository.save(any(VerificationToken.class))).thenAnswer(invocation -> {
                VerificationToken token = invocation.getArgument(0);
                token.setUuid(validTokenUuid);
                return token;
            });

            // Act
            VerificationToken result = verificationTokenService.generateVerificationToken(testUser,
                    TokenType.EMAIL_VALIDATION);

            // Assert
            assertNotNull(result);
            assertEquals(testUser, result.getUser());
            assertEquals(TokenType.EMAIL_VALIDATION, result.getTokenType());
            assertTrue(result.getExpirationDate().isAfter(result.getCreationDate()));
            assertFalse(result.isActivated());
            assertNull(result.getActivationDate());

            // Verify
            ArgumentCaptor<VerificationToken> tokenCaptor = ArgumentCaptor.forClass(VerificationToken.class);
            verify(verificationRepository).save(tokenCaptor.capture());

            VerificationToken capturedToken = tokenCaptor.getValue();
            assertEquals(testUser, capturedToken.getUser());
            assertEquals(TokenType.EMAIL_VALIDATION, capturedToken.getTokenType());
            assertNotNull(capturedToken.getCreationDate());
            assertNotNull(capturedToken.getExpirationDate());
            // Should be 24 hours validity
            long hoursDifference = java.time.Duration.between(
                    capturedToken.getCreationDate().atZone(ZonedDateTime.now().getZone()),
                    capturedToken.getExpirationDate().atZone(ZonedDateTime.now().getZone())).toHours();
            assertEquals(24, hoursDifference);
        }

        @Test
        @DisplayName("Should generate and save a valid reset password token")
        void generateVerificationToken_WithValidUser_ResetPassword_ReturnsSavedToken() {
            // Arrange
            when(verificationRepository.save(any(VerificationToken.class))).thenAnswer(invocation -> {
                VerificationToken token = invocation.getArgument(0);
                token.setUuid(validTokenUuid);
                return token;
            });

            // Act
            VerificationToken result = verificationTokenService.generateVerificationToken(testUser,
                    TokenType.RESET_PASSWORD);

            // Assert
            assertNotNull(result);
            assertEquals(testUser, result.getUser());
            assertEquals(TokenType.RESET_PASSWORD, result.getTokenType());

            // Verify
            verify(verificationRepository).save(any(VerificationToken.class));
        }
    }

    @Nested
    @DisplayName("Confirm Verification Token Tests")
    class ConfirmVerificationTokenTests {

        @Test
        @DisplayName("Should confirm valid token and enable user")
        void confirmVerificationToken_ValidToken_ActivatesUserAndToken() {
            // Arrange
            when(verificationRepository.findById(validTokenUuid)).thenReturn(Optional.of(validToken));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(verificationRepository.save(any(VerificationToken.class))).thenReturn(validToken);

            // Act
            boolean result = verificationTokenService.confirmVerificationToken(validTokenUuid);

            // Assert
            assertTrue(result);
            assertTrue(testUser.getEnabled());

            // Verify
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();
            assertTrue(savedUser.getEnabled());

            ArgumentCaptor<VerificationToken> tokenCaptor = ArgumentCaptor.forClass(VerificationToken.class);
            verify(verificationRepository).save(tokenCaptor.capture());
            VerificationToken savedToken = tokenCaptor.getValue();
            assertTrue(savedToken.isActivated());
            assertNotNull(savedToken.getActivationDate());
        }

        @Test
        @DisplayName("Should return false when token not found")
        void confirmVerificationToken_TokenNotFound_ReturnsFalse() {
            // Arrange
            when(verificationRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

            // Act
            boolean result = verificationTokenService.confirmVerificationToken(UUID.randomUUID());

            // Assert
            assertFalse(result);

            // Verify
            verify(verificationRepository).findById(any(UUID.class));
            verifyNoInteractions(userRepository);
            verify(verificationRepository, never()).save(any(VerificationToken.class));
        }

        @Test
        @DisplayName("Should return false when token is expired")
        void confirmVerificationToken_ExpiredToken_ReturnsFalse() {
            // Arrange
            when(verificationRepository.findById(expiredTokenUuid)).thenReturn(Optional.of(expiredToken));

            // Act
            boolean result = verificationTokenService.confirmVerificationToken(expiredTokenUuid);

            // Assert
            assertFalse(result);

            // Verify
            verify(verificationRepository).findById(expiredTokenUuid);
            verifyNoInteractions(userRepository);
            verify(verificationRepository, never()).save(any(VerificationToken.class));
        }
    }

    @Nested
    @DisplayName("Find Verification By Token Tests")
    class FindVerificationByTokenTests {

        @Test
        @DisplayName("Should return valid token when found")
        void findVerificationByToken_ValidToken_ReturnsToken() {
            // Arrange
            when(verificationRepository.findById(validTokenUuid)).thenReturn(Optional.of(validToken));

            // Act
            VerificationToken result = verificationTokenService.findVerificationByToken(validTokenUuid);

            // Assert
            assertNotNull(result);
            assertEquals(validTokenUuid, result.getUuid());
            assertEquals(testUser, result.getUser());
            assertEquals(TokenType.EMAIL_VALIDATION, result.getTokenType());

            // Verify
            verify(verificationRepository).findById(validTokenUuid);
        }

        @Test
        @DisplayName("Should throw TokenNotFoundException when token not found")
        void findVerificationByToken_TokenNotFound_ThrowsException() {
            // Arrange
            when(verificationRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

            // Act & Assert
            TokenNotFoundException exception = assertThrows(TokenNotFoundException.class,
                    () -> verificationTokenService.findVerificationByToken(UUID.randomUUID()));

            assertEquals("Verification token not found", exception.getMessage());

            // Verify
            verify(verificationRepository).findById(any(UUID.class));
        }

        @Test
        @DisplayName("Should throw TokenInvalidException when token is expired")
        void findVerificationByToken_ExpiredToken_ThrowsException() {
            // Arrange
            when(verificationRepository.findById(expiredTokenUuid)).thenReturn(Optional.of(expiredToken));

            // Act & Assert
            TokenInvalidException exception = assertThrows(TokenInvalidException.class,
                    () -> verificationTokenService.findVerificationByToken(expiredTokenUuid));

            assertEquals("Token is expired, please try again.", exception.getMessage());

            // Verify
            verify(verificationRepository).findById(expiredTokenUuid);
        }
    }

    @Nested
    @DisplayName("Find Verification By User Tests")
    class FindVerificationByUserTests {

        @Test
        @DisplayName("Should return valid token when found by user")
        void findVerificationByUser_ValidUser_ReturnsToken() {
            // Arrange
            when(verificationRepository.findByUserMostRecent(testUser)).thenReturn(Optional.of(validToken));

            // Act
            VerificationToken result = verificationTokenService.findVerificationByUser(testUser);

            // Assert
            assertNotNull(result);
            assertEquals(validTokenUuid, result.getUuid());
            assertEquals(testUser, result.getUser());

            // Verify
            verify(verificationRepository).findByUserMostRecent(testUser);
        }

        @Test
        @DisplayName("Should throw TokenNotFoundException when token not found for user")
        void findVerificationByUser_TokenNotFound_ThrowsException() {
            // Arrange
            when(verificationRepository.findByUserMostRecent(testUser)).thenReturn(Optional.empty());

            // Act & Assert
            TokenNotFoundException exception = assertThrows(TokenNotFoundException.class,
                    () -> verificationTokenService.findVerificationByUser(testUser));

            assertEquals("Verification token not found", exception.getMessage());

            // Verify
            verify(verificationRepository).findByUserMostRecent(testUser);
        }

        @Test
        @DisplayName("Should throw TokenInvalidException when user token is expired")
        void findVerificationByUser_ExpiredToken_ThrowsException() {
            // Arrange
            when(verificationRepository.findByUserMostRecent(testUser)).thenReturn(Optional.of(expiredToken));

            // Act & Assert
            TokenInvalidException exception = assertThrows(TokenInvalidException.class,
                    () -> verificationTokenService.findVerificationByUser(testUser));

            assertEquals("Token is expired, please try again.", exception.getMessage());

            // Verify
            verify(verificationRepository).findByUserMostRecent(testUser);
        }
    }

    @Nested
    @DisplayName("Save Verification Token Tests")
    class SaveVerificationTokenTests {

        @Test
        @DisplayName("Should save token to repository")
        void saveVerificationToken_ValidToken_SavesToRepository() {
            // Arrange
            when(verificationRepository.save(validToken)).thenReturn(validToken);

            // Act
            verificationTokenService.saveVerificationToken(validToken);

            // Verify
            verify(verificationRepository).save(validToken);
        }
    }

    @Nested
    @DisplayName("Find By Id Or Else Null Tests")
    class FindByIdOrElseNullTests {

        @Test
        @DisplayName("Should return token when found")
        void findByIdOrElseNull_ExistingToken_ReturnsToken() {
            // Arrange
            when(verificationRepository.findById(validTokenUuid)).thenReturn(Optional.of(validToken));

            // Act
            VerificationToken result = verificationTokenService.findByIdOrElseNull(validTokenUuid);

            // Assert
            assertNotNull(result);
            assertEquals(validTokenUuid, result.getUuid());

            // Verify
            verify(verificationRepository).findById(validTokenUuid);
        }

        @Test
        @DisplayName("Should return null when token not found")
        void findByIdOrElseNull_NonExistingToken_ReturnsNull() {
            // Arrange
            UUID randomUuid = UUID.randomUUID();
            when(verificationRepository.findById(randomUuid)).thenReturn(Optional.empty());

            // Act
            VerificationToken result = verificationTokenService.findByIdOrElseNull(randomUuid);

            // Assert
            assertNull(result);

            // Verify
            verify(verificationRepository).findById(randomUuid);
        }
    }
}