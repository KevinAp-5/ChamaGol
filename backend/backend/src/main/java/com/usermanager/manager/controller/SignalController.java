package com.usermanager.manager.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.usermanager.manager.dto.signal.SignalCreated;
import com.usermanager.manager.dto.signal.SignalDTO;
import com.usermanager.manager.service.signals.SignalService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("api/signals")
@Slf4j
public class SignalController {
    private final SignalService signalsService;

    public SignalController(SignalService signalsService) {
        this.signalsService = signalsService;
    }

    // Create
    @PostMapping
    public ResponseEntity<SignalCreated> createSignal(@RequestBody SignalDTO data) {
        log.info("signal {}", data);
        SignalCreated response = signalsService.createSignal(data);
        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/signals")
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri())
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<SignalDTO>> getAllSignals() {
        return ResponseEntity.ok(signalsService.getSignal());
    }

    // TODO; criar endpoint para pegar os ultimos 10 sinais
}
