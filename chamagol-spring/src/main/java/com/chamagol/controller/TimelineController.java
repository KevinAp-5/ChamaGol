package com.chamagol.controller;

import java.time.Duration;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.util.TimelineResponse;
import com.chamagol.enums.TipoEvento;
import com.chamagol.service.util.TimelineService;

import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<TimelineResponse> streamTimeline() {
        // Atualizações a cada 1 segundo, enviando novos sinais
        return Flux.interval(Duration.ofSeconds(1))
                   .flatMap(i -> timelineService.getLatestUpdates());
    }

    @GetMapping
    public ResponseEntity<Page<TimelineResponse>> getTimeline(Pageable pageable) {
        Page<TimelineResponse> timeline = timelineService.getTimeline(pageable);
        return ResponseEntity.ok(timeline);
    }

    @GetMapping("filter")
    public ResponseEntity<Page<TimelineResponse>> getFilteredTimeline(
        @RequestParam(value = "tipoEvento") TipoEvento tipoEvento, Pageable pageable
    ) {
        return ResponseEntity.ok(timelineService.getFilteredTimeline(tipoEvento, pageable));
    }
}
