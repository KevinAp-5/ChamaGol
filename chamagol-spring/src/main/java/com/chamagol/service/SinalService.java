package com.chamagol.service;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.sinal.SinalDTO;
import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.dto.sinal.mapper.SinalMapper;
import com.chamagol.exception.IDNotFoundException;
import com.chamagol.model.Sinal;
import com.chamagol.repository.SinalRepository;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Service
public class SinalService {
    private SinalRepository sinalRepository;
    private SinalMapper sinalMapper; 

    public SinalService(SinalRepository sinalRepository, SinalMapper sinalMapper) {
        this.sinalRepository = sinalRepository;
        this.sinalMapper = sinalMapper;
    }

    public ResponseEntity<List<SinalListagem>> getSinal() {
        var lista = sinalRepository.findAll()
        .stream()
        .map(SinalListagem:: new)
        .toList();

        return ResponseEntity.ok(lista);
    }

    @Transactional
    public ResponseEntity<SinalListagem> create(SinalDTO sinalDTO, UriComponentsBuilder uriComponentsBuilder) {
        Sinal sinal = sinalMapper.toEntity(sinalDTO);
        sinalRepository.save(sinal);
        var uri = buildSinalUri(uriComponentsBuilder, sinalDTO.id());
        return ResponseEntity.created(uri).body(new SinalListagem(sinal));
    }

    private URI buildSinalUri (UriComponentsBuilder uriComponentsBuilder, Long sinalID) {
        return uriComponentsBuilder.path("/api/sinal/{id}").buildAndExpand(sinalID).toUri();
    }

    public ResponseEntity<SinalListagem> getSinalById(@Positive @NotNull Long id) {
        Sinal sinal = sinalRepository.findById(id).orElseThrow(
            () -> new IDNotFoundException(""+id)
        );

        return ResponseEntity.ok(new SinalListagem(sinal));
    }

    @Transactional
    public ResponseEntity<String> delete(@NotNull @Positive Long id) {
        Sinal sinal = sinalRepository.findById(id).orElseThrow(
            () -> new IDNotFoundException(""+id)
        );

        sinal.inactivate();
        sinalRepository.save(sinal);
        return ResponseEntity.ok().build();
    }
}
