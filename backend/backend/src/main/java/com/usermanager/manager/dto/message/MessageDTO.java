package com.usermanager.manager.dto.message;

import java.time.ZonedDateTime;

import com.usermanager.manager.enums.People;
import com.usermanager.manager.model.message.Message;

public record MessageDTO(Long id, String content, ZonedDateTime created_at, People people) {

    public MessageDTO(Message message) {
        this(message.getId(), message.getContent(), message.getCreated_at(), message.getPeople());
    }
}
