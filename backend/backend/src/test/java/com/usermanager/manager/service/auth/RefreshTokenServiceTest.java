package com.usermanager.manager.service.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.usermanager.manager.exception.authentication.TokenInvalidException;
import com.usermanager.manager.exception.authentication.TokenNotFoundException;
import com.usermanager.manager.model.security.RefreshToken;
import com.usermanager.manager.model.security.TokenProvider;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.repository.RefreshTokenRepository;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private TokenProvider tokenProvider;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User mockUser;
    private RefreshToken mockRefreshToken;
    private static final String TEST_TOKEN = "test-token";
    private static final long EXPIRATION_TIME = 1440L; // 24 hours

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setLogin("test@example.com");
        
        mockRefreshToken = new RefreshToken(mockUser, TEST_TOKEN);
        mockRefreshToken.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRATION_TIME));
        
        ReflectionTestUtils.setField(refreshTokenService, "expirationTime", EXPIRATION_TIME);
    }

    @Nested
    @DisplayName("Create Refresh Token Tests")
    class CreateRefreshTokenTests {
        
        @Test
        @DisplayName("Should create new refresh token successfully")
        void createRefreshToken_Success() {
            when(tokenProvider.generateToken(mockUser, EXPIRATION_TIME)).thenReturn(TEST_TOKEN);
            when(refreshTokenRepository.existsByToken(TEST_TOKEN)).thenReturn(false);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(mockRefreshToken);

            String result = refreshTokenService.createRefreshToken(mockUser);

            assertEquals(TEST_TOKEN, result);
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("Should handle duplicate token by deleting existing one")
        void createRefreshToken_HandlesDuplicateToken() {
            when(tokenProvider.generateToken(mockUser, EXPIRATION_TIME)).thenReturn(TEST_TOKEN);
            when(refreshTokenRepository.existsByToken(TEST_TOKEN)).thenReturn(true);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(mockRefreshToken);

            refreshTokenService.createRefreshToken(mockUser);

            verify(refreshTokenRepository).deleteByToken(TEST_TOKEN);
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("Should throw exception when token generation fails")
        void createRefreshToken_ThrowsException_WhenGenerationFails() {
            when(tokenProvider.generateToken(mockUser, EXPIRATION_TIME)).thenReturn(null);

            assertThrows(TokenNotFoundException.class, 
                () -> refreshTokenService.createRefreshToken(mockUser));
            
            verify(refreshTokenRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Invalidate Token Tests")
    class InvalidateTokenTests {
        
        @Test
        @DisplayName("Should invalidate token successfully")
        void invalidateToken_Success() {
            when(refreshTokenRepository.findByToken(TEST_TOKEN))
                .thenReturn(Optional.of(mockRefreshToken));

            boolean result = refreshTokenService.invalidateToken(TEST_TOKEN);

            assertTrue(result);
            assertTrue(mockRefreshToken.getUsed());
            verify(refreshTokenRepository).save(mockRefreshToken);
        }

        @Test
        @DisplayName("Should throw exception when token not found")
        void invalidateToken_ThrowsException_WhenTokenNotFound() {
            when(refreshTokenRepository.findByToken(TEST_TOKEN))
                .thenReturn(Optional.empty());

            assertThrows(TokenNotFoundException.class, 
                () -> refreshTokenService.invalidateToken(TEST_TOKEN));
            
            verify(refreshTokenRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Find Token Tests")
    class FindTokenTests {
        
        @Test
        @DisplayName("Should find valid token successfully")
        void findByToken_Success() {
            when(refreshTokenRepository.findByToken(TEST_TOKEN))
                .thenReturn(Optional.of(mockRefreshToken));

            RefreshToken result = refreshTokenService.findByToken(TEST_TOKEN);

            assertNotNull(result);
            assertEquals(TEST_TOKEN, result.getToken());
            assertFalse(result.getUsed());
        }

        @Test
        @DisplayName("Should throw exception when token is already used")
        void findByToken_ThrowsException_WhenTokenUsed() {
            mockRefreshToken.setUsed(true);
            when(refreshTokenRepository.findByToken(TEST_TOKEN))
                .thenReturn(Optional.of(mockRefreshToken));

            assertThrows(TokenInvalidException.class, 
                () -> refreshTokenService.findByToken(TEST_TOKEN));
        }

        @Test
        @DisplayName("Should throw exception when token is expired")
        void findByToken_ThrowsException_WhenTokenExpired() {
            mockRefreshToken.setExpiresAt(LocalDateTime.now().minusMinutes(1));
            when(refreshTokenRepository.findByToken(TEST_TOKEN))
                .thenReturn(Optional.of(mockRefreshToken));

            assertThrows(TokenInvalidException.class, 
                () -> refreshTokenService.findByToken(TEST_TOKEN));
        }

        @Test
        @DisplayName("Should throw exception when token not found")
        void findByToken_ThrowsException_WhenTokenNotFound() {
            when(refreshTokenRepository.findByToken(TEST_TOKEN))
                .thenReturn(Optional.empty());

            assertThrows(TokenNotFoundException.class, 
                () -> refreshTokenService.findByToken(TEST_TOKEN));
        }
    }

    @Test
    @DisplayName("Should check if token exists")
    void existsByToken_Success() {
        when(refreshTokenRepository.existsByToken(TEST_TOKEN)).thenReturn(true);

        assertTrue(refreshTokenService.existsByToken(TEST_TOKEN));
        verify(refreshTokenRepository).existsByToken(TEST_TOKEN);
    }
}