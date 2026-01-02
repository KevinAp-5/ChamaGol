package com.usermanager.manager.service.message.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.dto.message.CreateMessage;
import com.usermanager.manager.dto.message.MessageDTO;
import com.usermanager.manager.model.message.Message;
import com.usermanager.manager.repository.MessageRepository;
import com.usermanager.manager.service.message.MessageService;

@Service
public class MessageServiceImpl implements MessageService{
    private MessageRepository messageRepository;

    public MessageServiceImpl(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Transactional
    public MessageDTO createMessage(CreateMessage request) {
        Message message = Message.builder()
            .content(request.content())
            .people(request.people())
            .build();

        return new MessageDTO(messageRepository.save(message));
    }
    
    public List<MessageDTO> getAll() {
        return messageRepository.findAll().stream()
            .map(MessageDTO::new)
            .collect(Collectors.toList());
    }
}
