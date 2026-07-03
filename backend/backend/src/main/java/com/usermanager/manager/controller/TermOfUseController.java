package com.usermanager.manager.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.usermanager.manager.dto.term.CreateTermRequest;
import com.usermanager.manager.dto.term.TermDTO;
import com.usermanager.manager.model.term.TermOfUse;
import com.usermanager.manager.service.term.TermOfUseService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/terms")
public class TermOfUseController {

    private final TermOfUseService termOfUseService;

    public TermOfUseController(TermOfUseService termOfUseService) {
        this.termOfUseService = termOfUseService;
    }

    @GetMapping("/latest")
    public ResponseEntity<TermDTO> getLatestTerm() {
        return ResponseEntity.ok()
                .body(new TermDTO(termOfUseService.findLatest()));
    }

    @GetMapping
    public ResponseEntity<List<TermDTO>> getAllTerms() {
        return ResponseEntity.ok(termOfUseService.findAll().stream()
            .map(TermDTO::new)
            .toList());
    }

    @PostMapping
    public ResponseEntity<TermDTO> createTerm(
        @org.springframework.web.bind.annotation.RequestBody @Valid CreateTermRequest request
    ) {
        log.info("term attempt: {}", request);
        TermOfUse term = termOfUseService.createTerm(request.version(), request.content());
        return ResponseEntity.ok(new TermDTO(term));
    }
}
