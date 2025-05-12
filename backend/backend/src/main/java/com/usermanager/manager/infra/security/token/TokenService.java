package com.usermanager.manager.infra.security.token;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.usermanager.manager.exception.authentication.JWTException;
import com.usermanager.manager.exception.authentication.TokenInvalid;
import com.usermanager.manager.model.security.TokenProvider;
import com.usermanager.manager.model.user.User;

@Service
public class TokenService implements TokenProvider{
    @Value("${api.security.token.secret}")
    private String secret;
    private static final String TOKEN_ISSUER = "UserManager";

    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                .withIssuer(TOKEN_ISSUER)
                .withSubject(user.getLogin())
                .withExpiresAt(genExpirationDate())
                .sign(algorithm);
        } catch (JWTCreationException e) {
            throw new JWTException("Error while generating token, " + e);
        }
    }

    public String generateToken(User user, long expirationMinutes) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                .withIssuer(TOKEN_ISSUER)
                .withSubject(user.getLogin())
                .withExpiresAt(genExpirationDate(expirationMinutes))
                .sign(algorithm);
        } catch (JWTCreationException e) {
            throw new JWTException("Error while generating token, " + e);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                .withIssuer(TOKEN_ISSUER)
                .build()
                .verify(token)
                .getSubject();
        } catch (JWTVerificationException e) {
            throw new TokenInvalid("Token invalid or expired.");
        }
    }

    public boolean isTokenValid(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            token = JWT.require(algorithm)
                .withIssuer(TOKEN_ISSUER)
                .build()
                .verify(token)
                .getSubject();
            return true;
        } catch (JWTVerificationException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                .withIssuer(TOKEN_ISSUER)
                .build()
                .verify(token)
                .getSubject();
        } catch (JWTVerificationException e) {
            throw new TokenInvalid("Token invalid or expired.");
        }
    }

    private Instant genExpirationDate() {
        return LocalDateTime.now().plusMinutes(2).toInstant(ZoneOffset.of("-03:00"));
    }

    private Instant genExpirationDate(long minutesAmount) {
        return LocalDateTime.now().plusMinutes(minutesAmount).toInstant(ZoneOffset.of("-03:00"));
    }
}
