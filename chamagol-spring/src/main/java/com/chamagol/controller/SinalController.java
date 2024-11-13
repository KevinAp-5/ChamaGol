package com.chamagol.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.sinal.SinalDTO;
import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.service.SinalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sinal")
public class SinalController {
    private final SinalService sinalService;

    public SinalController(SinalService sinalService) {
        this.sinalService = sinalService;
    }

    @GetMapping
    public ResponseEntity<List<SinalListagem>> getSinal() {
        return sinalService.getSinal();
    }

    @PostMapping
    public ResponseEntity<SinalListagem> create(@RequestBody @Valid SinalDTO sinalDTO, UriComponentsBuilder uriComponentsBuilder) {
        return sinalService.create(sinalDTO, uriComponentsBuilder);
    }
}
