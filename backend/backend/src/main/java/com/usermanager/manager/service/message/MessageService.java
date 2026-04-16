package com.usermanager.manager.service.message;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.usermanager.manager.dto.message.CreateMessage;
import com.usermanager.manager.dto.message.MessageDTO;

public interface MessageService {
    public MessageDTO createMessage(CreateMessage request);

    public List<MessageDTO> findAfterIdOrdered(Long afterId);

    public Page<MessageDTO> findAllPaged(Pageable pageable);
}
