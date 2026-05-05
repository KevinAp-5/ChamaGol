package com.usermanager.manager.infra.listener;

import java.util.List;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Component;

import com.usermanager.manager.infra.event.MessageCreatedEvent;
import com.usermanager.manager.infra.service.PushNotificationService;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.user.UserService;
import com.usermanager.manager.websocket.presence.PresenceService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@AllArgsConstructor
@EnableAsync
public class MessageListener {

    private final UserService userService;
    private final PushNotificationService pushNotificationService;
    private final PresenceService presenceService;

    @EventListener
    @Async
    public void handleMessageCreatedEvent(MessageCreatedEvent event) {
        log.info("Evento recebido pelo id: {}", event.messageId());

        List<User> usersToSendNotification = userService.getAllActiveUsers();

        List<Long> usersIds = usersToSendNotification.stream()
                .map(User::getId)
                .filter(userId -> !presenceService.isOnline(userId))
                .toList();

        log.info("users to send notification: {}", usersIds);
        pushNotificationService.sendToUsers(usersIds, "Novo sinal", "clique para abrir o novo sinal");
    }
}
