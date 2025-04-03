package com.chamagol.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.service.util.SinalService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/timeline")
@Slf4j
public class TimelineController {

    private final SinalService sinalService;

    public TimelineController(SinalService sinalService) {
        this.sinalService = sinalService;
    }

    @GetMapping
    public ResponseEntity<Page<SinalListagem>> getTimeline(Pageable pageable) {
        var timeline = sinalService.getSinalActive(pageable);
        return ResponseEntity.ok(timeline);
    }

}
