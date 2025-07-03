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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Sinais", description = "Endpoints para gerenciamento de sinais")
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

    @Operation(summary = "Criar novo sinal")
    @ApiResponse(responseCode = "201", description = "Sinal criado")
    // Create
    @PostMapping
    public ResponseEntity<SignalCreated> createSignal(
        @RequestBody(
            description = "Dados do sinal",
            required = true,
            content = @Content(schema = @Schema(implementation = SignalDTO.class))
        )
       @org.springframework.web.bind.annotation.RequestBody SignalDTO data
    ) {
        log.info("signal {}", data);
        Signal response = signalsService.createSignal(data);
        // Envia o sinal para o WebSocket (todos os clientes conectados)
        messagingTemplate.convertAndSend("/topic/messages", response);

        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/signals")
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri())
                .body(signalMapper.entityToSignalCreated(response));
    }

    @Operation(summary = "Listar todos os sinais")
    @ApiResponse(responseCode = "200", description = "Lista de sinais")
    @GetMapping
    public ResponseEntity<List<SignalDTO>> getAllSignals() {
        return ResponseEntity.ok(signalsService.getSignal());
    }

    // TODO; criar endpoint para pegar os ultimos 10 sinais
}
