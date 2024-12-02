package com.chamagol.service.util;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.redisson.api.RMapCache;
import org.redisson.api.RedissonClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.enums.Status;
import com.chamagol.enums.TipoEvento;
import com.chamagol.exception.IDNotFoundException;
import com.chamagol.model.Sinal;
import com.chamagol.repository.SinalRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SinalCacheService {

    private static final long CACHE_EXPIRATION_MINUTES = 20;

    private final SinalRepository sinalRepository;
    private final RMapCache<String, List<SinalListagem>> sinalCache;
    private final RedissonClient rClient;

    public SinalCacheService(SinalRepository sinalRepository, RedissonClient redissonClient, RedissonClient rClient) {
        this.sinalRepository = sinalRepository;
        this.sinalCache = redissonClient.getMapCache("sinalCache");
        this.rClient = rClient;
    }

    // Recupera sinais ativos com paginação e cache
    public Page<SinalListagem> getSinalActive(Pageable pageable) {
        String cacheKey = buildCacheKey(pageable, "sinaisAtivos");
        return getCachedPage(cacheKey, pageable, 
            () -> sinalRepository.findByStatus(Status.ACTIVE, pageable));
    }

    // Recupera todos os sinais com paginação e cache
    public Page<SinalListagem> getSinal(Pageable pageable) {
        String cacheKey = buildCacheKey(pageable, "sinaisTodos");
        return getCachedPage(cacheKey, pageable, 
            () -> sinalRepository.findAll(pageable));
    }


    // Recupera sinais filtrados por tipo de evento com paginação e cache
    public Page<SinalListagem> getFilteredSinais(TipoEvento tipoEvento, Pageable pageable) {
        String cacheKey = buildCacheKey(pageable, "sinaisFiltered_" + tipoEvento);
        return getCachedPage(cacheKey, pageable, 
            () -> sinalRepository.findByTipoEvento(tipoEvento, pageable));
    }

    // Recupera os 10 sinais mais recentes, utilizando cache
    public List<SinalListagem> getTop10() {
        String cacheKey = "sinaisTop10";
        return getCachedList(cacheKey, 
            () -> sinalRepository.findTop10ByOrderByCreatedAtDesc()
                    .stream()
                    .map(SinalListagem::new)
                    .collect(Collectors.toList()));
    }

    // Atualiza um sinal específico no cache
    public void atualizarSinal(Sinal sinal) {
        limparCache(); // Limpa o cache, pois as alterações afetam as listagens.
        log.info("Cache atualizado para sinal: {}", sinal.getId());
    }

    // Remove um sinal específico do cache
    public void removerSinal(Long id) {
        limparCache(); // Limpa o cache, pois as alterações afetam as listagens.
        log.info("Cache limpo após remover o sinal: {}", id);
    }

    // Limpa o cache de sinais
    public void limparCache() {
        sinalCache.clear();
        log.info("Cache de sinais completamente limpo.");
    }

    // ---------------- MÉTODOS AUXILIARES ----------------

    private Page<SinalListagem> getCachedPage(String cacheKey, Pageable pageable, CacheLoader<Page<Sinal>> dbLoader) {
        List<SinalListagem> cachedList = sinalCache.get(cacheKey);

        if (cachedList != null) {
            log.info("Cache hit: {}", cacheKey);
            return new PageImpl<>(cachedList, pageable, cachedList.size());
        }

        log.info("Cache miss: {}", cacheKey);
        Page<Sinal> sinaisPage = dbLoader.load();
        List<SinalListagem> sinalListagem = sinaisPage.getContent()
                .stream()
                .map(SinalListagem::new)
                .collect(Collectors.toList());

        sinalCache.put(cacheKey, sinalListagem, CACHE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
        return new PageImpl<>(sinalListagem, pageable, sinaisPage.getTotalElements());
    }

    private List<SinalListagem> getCachedList(String cacheKey, CacheLoader<List<SinalListagem>> dbLoader) {
        List<SinalListagem> cachedList = sinalCache.get(cacheKey);

        if (cachedList != null) {
            log.info("Cache hit: {}", cacheKey);
            return cachedList;
        }

        log.info("Cache miss: {}", cacheKey);
        List<SinalListagem> dataList = dbLoader.load();
        sinalCache.put(cacheKey, dataList, CACHE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
        return dataList;
    }

    private String buildCacheKey(Pageable pageable, String baseKey) {
        return String.format("%s_%d_%d", baseKey, pageable.getPageNumber(), pageable.getPageSize());
    }

    private String buildSinalIdKeys(Long id, String baseKey) {
        return String.format("%s_%d", baseKey, id);
    }

    @FunctionalInterface
    private interface CacheLoader<T> {
        T load();
    }

    public SinalListagem getSinalById(Long id) {
        RMapCache<String, Sinal> sinalIdCache = rClient.getMapCache("sinalByIdCache");
        var cacheKey = buildSinalIdKeys(id, "sinal_");
        var sinal = sinalIdCache.get(cacheKey);
    
        if (sinal != null) {
            log.info("cache hit id {}", id);
            return new SinalListagem(sinal);
        }
    
        log.info("Cache miss id {}", id);
        Sinal dbResponse = sinalRepository.findById(id)
            .orElseThrow(() -> new IDNotFoundException(id + " sinal não encontrado"));
        
        if (dbResponse != null) {
            sinalIdCache.put(cacheKey, dbResponse, 5, TimeUnit.MINUTES);
        } else {
            log.error("Unexpected null sinal for id {}", id);
        }
        
        return new SinalListagem(dbResponse);
    }
}

