package com.chamagol.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.enums.TipoEvento;
import com.chamagol.service.util.SinalService;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@RestController
@RequestMapping("/api/timeline")
@Slf4j
public class TimelineController {

    private final SinalService sinalService;
    private final Sinks.Many<List<SinalListagem>> sink = Sinks.many().replay().latest();

    public TimelineController(SinalService sinalService) {
        this.sinalService = sinalService;
         // Inscreve no tópico Redis para ouvir eventos de alteração
        sinalService.getTopic().addListener(Object.class, (channel, message) -> 
            // Atualiza o stream com os 10 sinais mais recentes
            atualizarStream()
        );
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


    // Endpoint SSE para transmitir sinais
    @GetMapping(value = "stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<List<SinalListagem>> streamSinais() {
        // Envia os 10 sinais iniciais ao cliente
        atualizarStream();

        // Retorna o Flux para manter a conexão ativa
        return sink.asFlux()
        .doOnError(e -> 
            // Log detalhado da exceção
            log.error("Erro no stream de sinais", e)
        )
        .onErrorResume(e -> Flux.empty()); // Ou tratamento personalizado
    }

    // Método para atualizar o stream
    private void atualizarStream() {
        // Obtém os 10 sinais mais recentes do serviço
        List<SinalListagem> latestSinais = sinalService.getLatestSignals();
        // Emite os novos sinais para os clientes conectados
        sink.tryEmitNext(latestSinais);
    }
}
