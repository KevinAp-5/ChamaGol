package com.usermanager.manager.infra.security.websocket;

import java.util.List;
import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.usermanager.manager.infra.security.token.TokenService;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.user.UserService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class WebSocketAuthInterceptor implements HandshakeInterceptor, ChannelInterceptor {

    private final TokenService tokenService;
    private final UserService userService;

    public WebSocketAuthInterceptor(TokenService tokenService, UserService userService) {
        this.tokenService = tokenService;
        this.userService = userService;
    }

    @Override
    public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response, @NonNull WebSocketHandler wsHandler,
          @NonNull Map<String, Object> attributes) throws Exception {
        log.info("Handshake URI: {}", request.getURI());
        log.info("Headers: {}", request.getHeaders());

        String token = extractToken(request);
        if (token == null) {
            log.warn("Token ausente no handshake WebSocket.");
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false; // BLOQUEIA handshake
        }

        if (!tokenService.isTokenValid(token)) {
            log.warn("Token inválido no handshake WebSocket.");
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false; // BLOQUEIA handshake
        }

        authenticateUser(token, attributes);
        return true;
    }

    private String extractToken(ServerHttpRequest request) {
        // Tentar extrair o token do cabeçalho Authorization
        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String token = authHeaders.get(0).replace("Bearer ", "");
            log.info("Token recebido via header: {}", token);
            return token;
        }

        // Tentar extrair o token dos parâmetros de consulta
        if (request.getURI().getQuery() != null) {
            for (String param : request.getURI().getQuery().split("&")) {
                if (param.startsWith("token=")) {
                    String token = param.substring(6);
                    log.info("Token recebido via query param: {}", token);
                    return token;
                }
            }
        }

        return null;
    }

    private void authenticateUser(String token, Map<String, Object> attributes) {
        String username = tokenService.getUsernameFromToken(token);
        log.info("Token válido para usuário: {}", username);

        User user = userService.findUserByLogin(username);
        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        attributes.put("user", auth);
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response, @NonNull WebSocketHandler wsHandler,
            @Nullable Exception exception) {
        // Método implementado vazio conforme original
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (accessor.getUser() != null || accessor.getSessionAttributes() == null) {
            return message;
        }

        var session = accessor.getSessionAttributes();
        if (session == null || session.isEmpty()) {
            return message;
        }
        Authentication auth = (Authentication) session.get("user");
        if (auth != null) {
            accessor.setUser(auth);
        }

        return message;
    }
}