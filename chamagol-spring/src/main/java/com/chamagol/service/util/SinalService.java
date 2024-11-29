package com.chamagol.service.util;

import java.io.Serializable;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamagol.dto.sinal.SinalDTO;
import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.dto.sinal.mapper.SinalMapper;
import com.chamagol.enums.TipoEvento;
import com.chamagol.exception.IDNotFoundException;
import com.chamagol.model.Sinal;
import com.chamagol.repository.SinalRepository;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Service
public class SinalService implements Serializable {
    private final transient SinalRepository sinalRepository;
    private final transient SinalMapper sinalMapper;
    private final transient SinalCacheService sinalCacheService;

    public SinalService(SinalRepository sinalRepository, SinalMapper sinalMapper, SinalCacheService sinalCacheService) {
        this.sinalRepository = sinalRepository;
        this.sinalMapper = sinalMapper;
        this.sinalCacheService = sinalCacheService;
    }

    // Retorna uma lista com todos os sinais, utilizando o cache
    public Page<SinalListagem> getSinal(Pageable pageable) {
        return sinalCacheService.getSinal(pageable);
    }

    // Retorna uma lista de sinais ativos, utilizando o cache
    public Page<SinalListagem> getSinalActive(Pageable pageable) {
        return sinalCacheService.getSinalActive(pageable);
    }

    // Retorna uma lista de sinais filtrados por tipo de evento, utilizando o cache
    public Page<SinalListagem> getFilteredSinais(TipoEvento tipoEvento, Pageable pageable) {
        return sinalCacheService.getFilteredSinais(tipoEvento, pageable);
    }

    // Cria um novo sinal e limpa o cache relevante
    @Transactional
    public SinalListagem create(SinalDTO sinalDTO) {
        Sinal sinal = sinalMapper.toEntity(sinalDTO);
        sinalRepository.save(sinal);

        sinalCacheService.limparCache(); // Limpa o cache após criar um novo sinal
        return new SinalListagem(sinal);
    }

    // Recupera um sinal por ID, utilizando o cache
    public SinalListagem getSinalById(@Positive @NotNull Long id) {
        return sinalCacheService.getSinalById(id);
    }

    // Deleta um sinal e limpa o cache relevante
    @Transactional
    public void delete(@NotNull @Positive Long id) {
        Sinal sinal = sinalRepository.findById(id)
            .orElseThrow(() -> new IDNotFoundException("Sinal não encontrado"));

        sinal.inactivate();
        sinalRepository.save(sinal);

        sinalCacheService.limparCache(); // Limpa o cache após deletar um sinal
    }

    public List<SinalListagem> getLatestSignals() {
        return sinalCacheService.getTop10(); // Busca os 10 últimos sinais
    }
}
