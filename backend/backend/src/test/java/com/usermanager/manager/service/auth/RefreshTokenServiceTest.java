package com.usermanager.manager.service.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @Test
    void createRefreshToken_ShouldReturnToken_WhenTokenGeneratedSuccessfully() {
        User user = new User();
        String generatedToken = "testToken";

        when(tokenProvider.generateToken(user, 0L)).thenReturn(generatedToken);

        String result = refreshTokenService.createRefreshToken(user);

        assertEquals(generatedToken, result);
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void createRefreshToken_ShouldThrowException_WhenTokenGenerationFails() {
        User user = new User();

        when(tokenProvider.generateToken(user, 0L)).thenReturn(null);

        assertThrows(TokenNotFoundException.class, () -> refreshTokenService.createRefreshToken(user));
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }

    @Test
    void invalidateToken_ShouldReturnTrue_WhenTokenIsValid() {
        String token = "testToken";
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(token);

        when(refreshTokenRepository.findByToken(token)).thenReturn(Optional.of(refreshToken));

        boolean result = refreshTokenService.invalidateToken(token);

        assertEquals(true, result);
        assertEquals(true, refreshToken.getUsed());
        verify(refreshTokenRepository, times(1)).save(refreshToken);
    }

    @Test
    void invalidateToken_ShouldThrowException_WhenTokenNotFound() {
        String token = "invalidToken";

        when(refreshTokenRepository.findByToken(token)).thenReturn(Optional.empty());

        assertThrows(TokenNotFoundException.class, () -> refreshTokenService.invalidateToken(token));
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }
}
