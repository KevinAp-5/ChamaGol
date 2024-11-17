package com.chamagol.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.util.TimelineResponse;
import com.chamagol.service.TimelineService;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @PreAuthorize("hasRole('USER') or hasRole('MESTRE') or hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<TimelineResponse>> getTimeline() {
        List<TimelineResponse> timeline = timelineService.getTimeline();
        return ResponseEntity.ok(timeline);
    }
}
