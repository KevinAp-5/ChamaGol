package com.usermanager.manager.controller;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;

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

@Tag(name = "Termos de Uso", description = "Endpoints para gerenciamento dos termos de uso")
@RestController
@RequestMapping("/api/terms")
public class TermOfUseController {

    private final TermOfUseService termOfUseService;

    public TermOfUseController(TermOfUseService termOfUseService) {
        this.termOfUseService = termOfUseService;
    }

    @Operation(summary = "Buscar termo de uso mais recente")
    @ApiResponse(responseCode = "200", description = "Termo de uso mais recente")
    @GetMapping("/latest")
    public ResponseEntity<TermDTO> getLatestTerm() {
        return ResponseEntity.ok()
                .body(new TermDTO(termOfUseService.findLatest()));
    }

    @Operation(summary = "Listar todos os termos de uso")
    @ApiResponse(responseCode = "200", description = "Lista de termos de uso")
    @GetMapping
    public ResponseEntity<List<TermDTO>> getAllTerms() {
        return ResponseEntity.ok(termOfUseService.findAll().stream()
            .map(TermDTO::new)
            .toList());
    }

    @Operation(summary = "Criar novo termo de uso")
    @ApiResponse(responseCode = "200", description = "Termo criado")
    @PostMapping
    public ResponseEntity<TermDTO> createTerm(
        @RequestBody(
            description = "Dados para criação do termo",
            required = true,
            content = @Content(schema = @Schema(implementation = CreateTermRequest.class))
        )
        @Valid CreateTermRequest request
    ) {
        TermOfUse term = termOfUseService.createTerm(request.version(), request.content());
        return ResponseEntity.ok(new TermDTO(term));
    }
}
