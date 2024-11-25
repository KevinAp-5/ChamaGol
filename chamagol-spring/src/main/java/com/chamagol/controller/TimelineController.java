package com.chamagol.controller;

import java.util.List;

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
    public ResponseEntity<List<TimelineResponse>> getTimeline() {
        List<TimelineResponse> timeline = timelineService.getTimeline();
        return ResponseEntity.ok(timeline);
    }

    @GetMapping("filter")
    public ResponseEntity<List<TimelineResponse>> getFilteredTimeline(
        @RequestParam(value = "tipoEvento") TipoEvento tipoEvento
    ) {
        return ResponseEntity.ok(timelineService.getFilteredTimeline(tipoEvento));
    }
}
