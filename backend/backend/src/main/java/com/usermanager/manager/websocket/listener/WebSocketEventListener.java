package com.usermanager.manager.websocket.listener;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.usermanager.manager.model.user.User;
import com.usermanager.manager.websocket.presence.PresenceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final PresenceService presenceService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        Authentication auth = (Authentication) accessor.getUser();

        if (auth == null && accessor.getSessionAttributes() != null) {
            auth = (Authentication) accessor.getSessionAttributes().get("user");
        }

        if (auth != null) {
            var user = (User) auth.getPrincipal();
            Long userId = user.getId();
            presenceService.markOnline(userId);
            log.info("Usuário ONLINE: {}", userId);
        } else {
            log.warn("Usuário não autenticado no evento de conexão WebSocket.");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        Authentication auth = (Authentication) accessor.getUser();

        if (auth == null && accessor.getSessionAttributes() != null) {
            auth = (Authentication) accessor.getSessionAttributes().get("user");
        }

        if (auth != null) {
            var user = (User) auth.getPrincipal();

            Long userId = user.getId();

            presenceService.markOffline(userId);

            log.info("Usuário OFFLINE: {}", userId);
        }
    }
}