package com.usermanager.manager.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.usermanager.manager.dto.signal.SignalCreated;
import com.usermanager.manager.dto.signal.SignalDTO;
import com.usermanager.manager.mappers.SignalMapper;
import com.usermanager.manager.model.signal.Signal;
import com.usermanager.manager.service.signals.SignalService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("api/signals")
@Slf4j
public class SignalController {
    private final SignalService signalsService;
    private final SimpMessagingTemplate messagingTemplate;
    private final SignalMapper signalMapper;

    public SignalController(SignalService signalsService, SimpMessagingTemplate messagingTemplate, SignalMapper signalMapper) {
        this.signalsService = signalsService;
        this.messagingTemplate = messagingTemplate;
        this.signalMapper = signalMapper;
    }

    @PostMapping
    public ResponseEntity<SignalCreated> createSignal(
       @org.springframework.web.bind.annotation.RequestBody SignalDTO data
    ) {
        log.info("signal {}", data);
        Signal response = signalsService.createSignal(data);
        messagingTemplate.convertAndSend("/topic/messages", response);

        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/signals")
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri())
                .body(signalMapper.entityToSignalCreated(response));
    }

    @GetMapping
    public ResponseEntity<List<SignalDTO>> getAllSignals() {
        return ResponseEntity.ok(signalsService.getSignal());
    }

}