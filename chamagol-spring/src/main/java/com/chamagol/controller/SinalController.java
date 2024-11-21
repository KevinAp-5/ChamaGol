package com.chamagol.controller;

import java.net.URI;
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

    @GetMapping
    public ResponseEntity<List<SinalListagem>> getSinalActive() {
        return ResponseEntity.ok(sinalService.getSinalActive());
    }

    @GetMapping("/all")
    public ResponseEntity<List<SinalListagem>> getSinal() {
        return ResponseEntity.ok(sinalService.getSinal());
    }

    @PreAuthorize("hasRole('MESTRE')")
    @PostMapping
    public ResponseEntity<SinalListagem> create(@RequestBody @Valid SinalDTO sinalDTO, UriComponentsBuilder uriComponentsBuilder) {
        var sinalListagem = sinalService.create(sinalDTO);
        return ResponseEntity.created(buildSinalUri(uriComponentsBuilder, sinalDTO.id())).body(sinalListagem);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SinalListagem> getSinalById(@PathVariable("id") @Positive @NotNull Long id) {
        return ResponseEntity.ok(sinalService.getSinalById(id));
    }

    @PreAuthorize("hasRole('MESTRE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable("id") @Positive @NotNull Long id) {
        sinalService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private URI buildSinalUri (UriComponentsBuilder uriComponentsBuilder, Long sinalID) {
        return uriComponentsBuilder.path("/api/sinal/{id}").buildAndExpand(sinalID).toUri();
    }

}
