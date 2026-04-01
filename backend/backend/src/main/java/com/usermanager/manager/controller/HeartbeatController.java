package com.usermanager.manager.controller;


import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import com.usermanager.manager.model.user.User;
import com.usermanager.manager.websocket.presence.PresenceService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class HeartbeatController {

    private final PresenceService presenceService;

    @MessageMapping("/heartbeat")
    public void heartbeat(Authentication auth) {

        if (auth != null) {
            var user = (User) auth.getPrincipal();

            presenceService.heartbeat(user.getId());
        }
    }
}