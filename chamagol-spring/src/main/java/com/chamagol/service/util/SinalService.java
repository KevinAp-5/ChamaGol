package com.chamagol.service.util;

import java.io.Serializable;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamagol.dto.sinal.SinalDTO;
import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.dto.sinal.mapper.SinalMapper;
import com.chamagol.enums.Status;
import com.chamagol.enums.TipoEvento;
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
    @Cacheable(value = "sinaisAll", key = "'sinaisTodos_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<SinalListagem> getSinal(Pageable pageable) {
        return sinalRepository.findAll(pageable).map(SinalListagem:: new);
    }

    @Cacheable(value = "sinaisAtivos", key = "'sinaisAtivos_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<SinalListagem> getSinalActive(Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            Sort.by("createdAt").descending()
        );
        return sinalRepository.findByStatus(Status.ACTIVE, sortedPageable)
            .map(SinalListagem::new);
    }

    @Cacheable(value = "sinaisFiltered", key = "'sinaisFiltrados_' + #tipoEvento + '_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<SinalListagem> getFilteredSinais(TipoEvento tipoEvento, Pageable pageable) {
        return sinalRepository.findByTipoEvento(tipoEvento.getTipo(), pageable)
            .map(SinalListagem::new); // Mapeia diretamente para o DTO
    }

    // Metodo create
    @Caching(
        evict = {
            @CacheEvict(value = "sinais", allEntries = true),
            @CacheEvict(value = "sinaisAll", allEntries = true),
            @CacheEvict(value = "sinaisFiltered", allEntries = true)
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

    @Caching(
        evict = {
            @CacheEvict(value = "sinais", allEntries = true),
            @CacheEvict(value = "sinaisAll", allEntries = true),
            @CacheEvict(value = "sinaisFiltered", allEntries = true)
        }
    )
    @Transactional
    public void delete(@NotNull @Positive Long id) {
        Sinal sinal = sinalRepository.findById(id).orElseThrow(
            () -> new IDNotFoundException(""+id)
        );

        sinal.inactivate();
        sinalRepository.save(sinal);
    }
}
