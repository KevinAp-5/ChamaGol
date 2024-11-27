package com.chamagol.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.util.TimelineResponse;
import com.chamagol.enums.TipoEvento;
import com.chamagol.service.util.TimelineService;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
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
