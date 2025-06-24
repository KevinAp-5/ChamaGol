package com.usermanager.manager.controller;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.usermanager.manager.dto.signal.SignalCreated;
import com.usermanager.manager.dto.signal.SignalDTO;
import com.usermanager.manager.service.signals.SignalService;

import lombok.extern.slf4j.Slf4j;

@Tag(name = "Sinais", description = "Endpoints para gerenciamento de sinais")
@RestController
@RequestMapping("api/signals")
@Slf4j
public class SignalController {
    private final SignalService signalsService;

    public SignalController(SignalService signalsService) {
        this.signalsService = signalsService;
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
        SignalDTO data
    ) {
        log.info("signal {}", data);
        SignalCreated response = signalsService.createSignal(data);
        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/signals")
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri())
                .body(response);
    }

    @Operation(summary = "Listar todos os sinais")
    @ApiResponse(responseCode = "200", description = "Lista de sinais")
    @GetMapping
    public ResponseEntity<List<SignalDTO>> getAllSignals() {
        return ResponseEntity.ok(signalsService.getSignal());
    }

    // TODO; criar endpoint para pegar os ultimos 10 sinais
}
