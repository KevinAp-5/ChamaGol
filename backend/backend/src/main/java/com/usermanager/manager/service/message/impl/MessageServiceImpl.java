package com.usermanager.manager.service.message.impl;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.dto.message.CreateMessage;
import com.usermanager.manager.dto.message.MessageDTO;
import com.usermanager.manager.infra.event.MessageCreatedEvent;
import com.usermanager.manager.model.message.Message;
import com.usermanager.manager.repository.MessageRepository;
import com.usermanager.manager.service.message.MessageService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {
    private MessageRepository messageRepository;
    private final ApplicationEventPublisher publisher;

    @Transactional
    public MessageDTO createMessage(CreateMessage request) {
        Message message = Message.builder()
                .content(request.content())
                .people(request.people())
                .build();

        Message savedMessage = messageRepository.save(message);

        this.publishEvent(new MessageCreatedEvent(
                savedMessage.getId(),
                "Nova mensagem",
                message.getContent()));
        return new MessageDTO(savedMessage);
    }

    public List<MessageDTO> getAll() {
        return messageRepository.findAll().stream()
                .map(MessageDTO::new)
                .collect(Collectors.toList());
    }

    public void publishEvent(Object event) {
        publisher.publishEvent(event);
    }

    public List<MessageDTO> findAfterIdOrdered(Long afterId) {
        return messageRepository.findByIdGreaterThanOrderByCreatedAtAsc(afterId)
                .stream()
                .map(MessageDTO::new)
                .toList();
    }

    public Page<MessageDTO> findAllPaged(Pageable pageable) {
        return messageRepository.findAll(pageable).map(MessageDTO::new);
    }

    @Transactional
    @Scheduled(cron = "@hourly")
    public void deleteExpiredMessages() {
        int deletedCount = messageRepository.deleteByCreatedAtBefore(ZonedDateTime.now().minusHours(13));
        log.info("messagesDeleted: {}", deletedCount);
    }
}
