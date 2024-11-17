package com.chamagol.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.sinal.SinalDTO;
import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.service.SinalService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/sinal")
public class SinalController {
    private final SinalService sinalService;

    public SinalController(SinalService sinalService) {
        this.sinalService = sinalService;
    }

    @PreAuthorize("hasRole('MESTRE')")
    @PostMapping
    public ResponseEntity<SinalListagem> create(@RequestBody @Valid SinalDTO sinalDTO, UriComponentsBuilder uriComponentsBuilder) {
        return sinalService.create(sinalDTO, uriComponentsBuilder);
    }

    @PreAuthorize("hasRole('MESTRE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable("id") @Positive @NotNull Long id) {
        return sinalService.delete(id);
    }

    @GetMapping
    public ResponseEntity<List<SinalListagem>> getSinalActive() {
        return sinalService.getSinalActive();
    }
}
