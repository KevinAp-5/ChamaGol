package com.usermanager.manager.service.auth;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.exception.authentication.TokenInvalidException;
import com.usermanager.manager.exception.authentication.TokenNotFoundException;
import com.usermanager.manager.model.security.RefreshToken;
import com.usermanager.manager.model.security.TokenProvider;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.repository.RefreshTokenRepository;

import lombok.extern.slf4j.Slf4j;
// TODO: migrar para interface para diminuir acoplamento

@Service
@Slf4j
public class RefreshTokenService {
    @Value("${api.security.token.refresh.expiration}")
    private long expirationTime;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenProvider tokenProvider;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, TokenProvider tokenProvider) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public String createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        String token = tokenProvider.generateToken(user, expirationTime);
        if (token == null) {
            throw new TokenNotFoundException("Failed to generate refresh token");
        }

        boolean exists = refreshTokenRepository.existsByToken(token);
        if (exists) {
            refreshTokenRepository.deleteByToken(token);
        }

        RefreshToken refreshToken = new RefreshToken(user, token);

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    @Transactional
    public boolean invalidateToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token).orElseThrow(
                () -> new TokenNotFoundException("Refresh Token not found"));

        refreshToken.setUsed(true);
        refreshTokenRepository.save(refreshToken);
        return true;
    }

    public boolean existsByToken(String token) {
        return refreshTokenRepository.existsByToken(token);
    }

    @Transactional
    public RefreshToken findByToken(String token) {
        var refreshToken = refreshTokenRepository.findByToken(token).orElseThrow(
                () -> new TokenNotFoundException("Refresh Token not found"));

        if (Boolean.TRUE.equals(refreshToken.getUsed())) {
            log.warn("Attempt to use an already used refresh token for user: {}", refreshToken.getUser().getLogin());
            throw new TokenInvalidException("Refresh Token already used. Please login again");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new TokenInvalidException("Refresh Token expired");
        }   

        return refreshToken;
    }
}
