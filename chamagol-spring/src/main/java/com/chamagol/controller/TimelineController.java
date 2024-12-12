package com.chamagol.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.enums.TipoEvento;
import com.chamagol.service.util.SinalService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/timeline")
@Slf4j
public class TimelineController {

    private final SinalService sinalService;
    private final SimpMessagingTemplate messagingTemplate;

    public TimelineController(SimpMessagingTemplate messagingTemplate,
        SinalService sinalService
    ) {
        this.sinalService = sinalService;
        this.messagingTemplate = messagingTemplate;

        // Configura listener para mudanças nos sinais
        sinalService.getTopic().addListener(String.class, (channel, message) -> {
            // Sempre que houver uma mudança, busca os 10 sinais mais recentes
            var latestSignals = sinalService.getLatestSignals();

            // Envia para todos os clientes subscritos no tópico
            this.messagingTemplate.convertAndSend("/topic/sinais", latestSignals);
        });
    }

    @GetMapping
    public ResponseEntity<Page<SinalListagem>> getTimeline(Pageable pageable) {
        var timeline = sinalService.getSinalActive(pageable);
        return ResponseEntity.ok(timeline);
    }

    @GetMapping("filter")
    public ResponseEntity<Page<SinalListagem>> getFilteredTimeline(
            @RequestParam TipoEvento tipoEvento, Pageable pageable) {
        return ResponseEntity.ok(sinalService.getFilteredSinais(tipoEvento, pageable));
    }

}
