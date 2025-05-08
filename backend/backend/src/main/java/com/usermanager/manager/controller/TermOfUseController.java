package com.usermanager.manager.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.usermanager.manager.dto.term.CreateTermRequest;
import com.usermanager.manager.model.term.TermOfUse;
import com.usermanager.manager.service.term.TermOfUseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/terms")
//TODO: mudar para DTO
public class TermOfUseController {

    private final TermOfUseService termOfUseService;

    public TermOfUseController(TermOfUseService termOfUseService) {
        this.termOfUseService = termOfUseService;
    }

    @GetMapping("/latest")
    public ResponseEntity<TermOfUse> getLatestTerm() {
        return ResponseEntity.ok()
                .body(termOfUseService.findLatest());
    }

    @GetMapping
    public ResponseEntity<List<TermOfUse>> getAllTerms() {
        return ResponseEntity.ok(termOfUseService.findAll());
    }

    @PostMapping
    public ResponseEntity<TermOfUse> createTerm(@Valid @RequestBody CreateTermRequest request) {
        TermOfUse term = termOfUseService.createTerm(request.version(), request.content());
        return ResponseEntity.ok(term);
    }
}
