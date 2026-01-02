package com.usermanager.manager.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.usermanager.manager.dto.message.CreateMessage;
import com.usermanager.manager.dto.message.MessageDTO;
import com.usermanager.manager.service.message.MessageService;

@RestController
@RequestMapping("/api/message")
public class MessageController {
    private MessageService messageService;
    private SimpMessagingTemplate messagingTemplate;

    public MessageController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }


    @PostMapping
    public ResponseEntity<MessageDTO> createMessage(@RequestBody CreateMessage request) {
        MessageDTO message = messageService.createMessage(request);
        messagingTemplate.convertAndSend("/topic/messages", message);
        return ResponseEntity.created(URI.create("/api/message/" + message.id().toString()))
            .body(message);
    }

}
