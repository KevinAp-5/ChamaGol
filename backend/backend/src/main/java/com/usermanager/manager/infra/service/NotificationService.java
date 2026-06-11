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

    public void send(String token, String title, String body) {
        Message message = Message.builder()
            .setToken(token)
            .setNotification(
                Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build()
            )
            .build();

        try {
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Mensagem enviada para token: {}. Response: {}", token, response);
        } catch (FirebaseMessagingException e) {
            log.error("Erro ao enviar mensagem para token: {}. Erro: {}", token, e);
        }
    }
}