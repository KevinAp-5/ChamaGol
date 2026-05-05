package com.usermanager.manager.controller;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.usermanager.manager.dto.message.CreateMessage;
import com.usermanager.manager.dto.message.MessageDTO;
import com.usermanager.manager.service.message.MessageService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/message")
public class MessageController {
    private MessageService messageService;
    private SimpMessagingTemplate messagingTemplate;

    public MessageController(MessageService messageService, SimpMessagingTemplate messagingTemplate,
            AuthController authController) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<MessageDTO> createMessage(@RequestBody CreateMessage request) {
        MessageDTO message = messageService.createMessage(request);

        log.info("Enviando para websocket: {}", request);
        log.info("message: {}", message.content());
        messagingTemplate.convertAndSend("/topic/messages", message);
        return ResponseEntity.created(URI.create("/api/message/" + message.id().toString()))
                .body(message);
    }

    @GetMapping()
    public ResponseEntity<Page<MessageDTO>> getMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long afterId) {
        if (afterId != null) {
            // Sync ao voltar ao foreground: busca tudo após o lastMessageId
            List<MessageDTO> newMessages = messageService.findAfterIdOrdered(afterId);
            return ResponseEntity.ok(new PageImpl<>(newMessages));
        }

        // Carregamento inicial e paginação por scroll
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(messageService.findAllPaged(pageable));
    }
}
