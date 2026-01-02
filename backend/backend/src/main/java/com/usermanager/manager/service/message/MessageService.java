package com.usermanager.manager.service.message;

import java.util.List;

import com.usermanager.manager.dto.message.CreateMessage;
import com.usermanager.manager.dto.message.MessageDTO;

public interface MessageService {
    public MessageDTO createMessage(CreateMessage request);

    public List<MessageDTO> getAll();
}
