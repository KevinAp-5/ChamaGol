package com.chamagol.service;

import java.io.Serializable;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamagol.dto.sinal.SinalDTO;
import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.dto.sinal.mapper.SinalMapper;
import com.chamagol.enums.Status;
import com.chamagol.exception.IDNotFoundException;
import com.chamagol.model.Sinal;
import com.chamagol.repository.SinalRepository;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Service
public class SinalService implements Serializable{
    private final transient SinalRepository sinalRepository;
    private final transient SinalMapper sinalMapper; 

    public SinalService(SinalRepository sinalRepository, SinalMapper sinalMapper) {
        this.sinalRepository = sinalRepository;
        this.sinalMapper = sinalMapper;
    }

    // Retorna uma lista com todos os sinais
    public List<SinalListagem> getSinal() {
        return sinalRepository.findAll()
        .stream()
        .map(SinalListagem:: new)
        .toList();
    }

    @Cacheable(value = "sinais", key = "'allSinais'")
    // Retorna uma lista de todos os sinais que estão ativos
    public List<SinalListagem> getSinalActive() {
        return sinalRepository.findByStatus(Status.ACTIVE)
        .stream()
        .map(SinalListagem:: new)
        .collect(Collectors.toList());
    }

    // Metodo create
    @Caching(
        evict = {
            @CacheEvict(value = "sinaisActive", allEntries = true),
            @CacheEvict(value = "sinal", allEntries = true)
        }
    )
    @Transactional
    public SinalListagem create(SinalDTO sinalDTO) {
        Sinal sinal = sinalMapper.toEntity(sinalDTO);
        sinalRepository.save(sinal);
        return new SinalListagem(sinal);
    }

    public SinalListagem getSinalById(@Positive @NotNull Long id) {
        Sinal sinal = sinalRepository.findById(id).orElseThrow(
            () -> new IDNotFoundException(""+id)
        );
        return new SinalListagem(sinal);
    }

    @Transactional
    public void delete(@NotNull @Positive Long id) {
        Sinal sinal = sinalRepository.findById(id).orElseThrow(
            () -> new IDNotFoundException(""+id)
        );

        sinal.inactivate();
        sinalRepository.save(sinal);
    }
}
