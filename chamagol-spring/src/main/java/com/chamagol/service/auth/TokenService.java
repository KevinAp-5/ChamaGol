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
import com.chamagol.dto.token.TokenDTO;
import com.chamagol.dto.usuario.UsuarioAutenticacao;
import com.chamagol.exception.TokenCreationException;
import com.chamagol.exception.TokenInvalid;
import com.chamagol.model.Usuario;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@Service
public class TokenService {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.tokenExpiration}")
    private Integer tokenTime;

    @Value("${jwt.refreshTokenExpiration}")
    private Integer refreshTokenTime;

    private final AuthenticationManager authenticationManager;

    TokenService(@Lazy AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    public String getToken(@Valid @NotNull Usuario usuario, Integer time) {
        try {
            var algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("ChamaGol")
                    .withSubject(usuario.getEmail())
                    .withExpiresAt(expirarToken(time))
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

    private Instant expirarToken(Integer time) {
        return LocalDateTime.now().plusMinutes(time).toInstant(ZoneOffset.of("-03:00"));
    }

    public TokenDTO authenticatedTokenByLogin(@Valid @NotNull UsuarioAutenticacao usuarioAutenticacao) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
            usuarioAutenticacao.email(),
            usuarioAutenticacao.senha()
            );

        Usuario auth = (Usuario) authenticationManager.authenticate(token).getPrincipal();
        return tokenBuilder(auth);
    }

    public TokenDTO tokenBuilder(@Valid @NotNull Usuario usuario) {
        return TokenDTO
            .builder()
            .token(getToken(usuario, tokenTime))
            .refreshToken(getToken(usuario, refreshTokenTime))
            .build();
    }
}
