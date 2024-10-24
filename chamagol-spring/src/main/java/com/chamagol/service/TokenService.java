package com.chamagol.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.chamagol.exception.TokenCreationException;
import com.chamagol.model.Usuario;

@Service
public class TokenService {
    @Value("${api.security.token.secret}")
    private String secret;

    public String getToken(Usuario usuario) {
        try {
            var algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("ChamaGol")
                    .withSubject(usuario.getEmail())
                    .withExpiresAt(expirarToken())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new TokenCreationException("Erro ao gerar token", exception);
        }
    }

    private Instant expirarToken() {
        return LocalDateTime.now().plusHours(1).toInstant(ZoneOffset.of("-03:00"));
    }
}
