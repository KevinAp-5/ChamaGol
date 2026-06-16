package com.usermanager.manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.usermanager.manager.dto.notification.NotificationRequest;
import com.usermanager.manager.infra.service.PushNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequestMapping("/api/notification")
@Controller
@RequiredArgsConstructor
public class NotificationController {

    private final PushNotificationService notificationService;

    @PostMapping
    public ResponseEntity<Void> send(@RequestBody NotificationRequest request) {
        notificationService.sendToAll(request.title(), request.title());
        return ResponseEntity.status(200).build();
    }
}
