package com.chamagol.service.auth;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.exception.TokenCreationException;
import com.chamagol.exception.TokenInvalid;
import com.chamagol.model.Usuario;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@Service
public class TokenService {
    @Value("${api.security.token.secret}")
    private String secret;

    private final AuthenticationManager authenticationManager;

    TokenService(@Lazy AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

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

    public String getSubject(String tokenJWT) {
        try {
            var algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("ChamaGol")
                    .build()
                    .verify(tokenJWT)
                    .getSubject();

        } catch (JWTVerificationException exception) {
            throw new TokenInvalid("Token inválido ou expirado");
        }
    }

    private Instant expirarToken() {
        return LocalDateTime.now().plusHours(1).toInstant(ZoneOffset.of("-03:00"));
    }

    public String authenticatedTokenByLogin(@Valid @NotNull UsuarioAutenticacao usuarioAutenticacao) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
            usuarioAutenticacao.email(),
            usuarioAutenticacao.senha()
            );
        var auth = authenticationManager.authenticate(token);
        return getToken((Usuario) auth.getPrincipal());
    }
}
