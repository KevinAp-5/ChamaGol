package com.usermanager.manager.infra.service;

import org.springframework.stereotype.Service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationService {

    public void sendNotificationToAllUsers(String title, String payload) {
        Message message = Message.builder()
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(payload)
                        .build())
                .setTopic("all_users")
                .putData("screen", "login")
                .build();

        String response;
        try {
            response = FirebaseMessaging.getInstance().send(message);
            log.info("notificação enviada: " + response);
        } catch (FirebaseMessagingException e) {
            log.info("Erro ao enviar notificação:" + e.getMessage());
        }
    }
}
