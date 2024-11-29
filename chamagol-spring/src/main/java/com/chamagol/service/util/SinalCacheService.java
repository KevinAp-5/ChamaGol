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
import com.chamagol.model.Sinal;
import com.chamagol.repository.SinalRepository;

@Service
public class SinalCacheService {
    private static final String SINAIS_ATIVOS_CACHE_KEY = "sinaisAtivos";
    private static final String SINAIS_TODOS_CACHE_KEY = "sinaisTodos";
    private static final long CACHE_EXPIRATION_MINUTES = 20;

    private final SinalRepository sinalRepository;
    private final RMapCache<String, List<Sinal>> sinalCache;

    public SinalCacheService(SinalRepository sinalRepository, RedissonClient redissonClient) {
        this.sinalRepository = sinalRepository;
        this.sinalCache = redissonClient.getMapCache("sinalCache");
    }

    /** Recupera sinais ativos com paginação e cache */
    public Page<SinalListagem> getSinalActive(Pageable pageable) {
        String cacheKey = buildCacheKey(pageable, SINAIS_ATIVOS_CACHE_KEY);

        // Tenta buscar do cache
        List<Sinal> cachedSinais = sinalCache.get(cacheKey);

        if (cachedSinais != null) {
            return convertToPagedResponse(cachedSinais, pageable);
        }

        // Caso não esteja no cache, buscar no banco
        Page<Sinal> sinaisPage = sinalRepository.findByStatus(Status.ACTIVE, pageable);

        // Salvar no cache
        cacheSinais(cacheKey, sinaisPage.getContent());

        return sinaisPage.map(SinalListagem::new);
    }

    /** Recupera todos os sinais com paginação e cache */
    public Page<SinalListagem> getSinal(Pageable pageable) {
        String cacheKey = buildCacheKey(pageable, SINAIS_TODOS_CACHE_KEY);

        // Tenta buscar do cache
        List<Sinal> cachedSinais = sinalCache.get(cacheKey);

        if (cachedSinais != null) {
            return convertToPagedResponse(cachedSinais, pageable);
        }

        // Caso não esteja no cache, buscar no banco
        Page<Sinal> sinaisPage = sinalRepository.findAll(pageable);

        // Salvar no cache
        cacheSinais(cacheKey, sinaisPage.getContent());

        return sinaisPage.map(SinalListagem::new);
    }

    /** Atualiza um sinal específico no cache */
    public void atualizarSinal(Sinal sinal) {
        // Atualizar sinal por chave
        sinalCache.put(buildSinalCacheKey(sinal.getId()), List.of(sinal), CACHE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
    }

    /** Remove um sinal específico do cache */
    public void removerSinal(Long id) {
        sinalCache.remove(buildSinalCacheKey(id));
    }

    // Limpa o cache
    public void limparCache() {
        sinalCache.clear();
    }

    /** Recupera um sinal por ID, consultando cache primeiro */
    public SinalListagem getSinalById(Long id) {
        String cacheKey = buildSinalCacheKey(id);

        List<Sinal> cachedSinal = sinalCache.get(cacheKey);

        if (cachedSinal != null && !cachedSinal.isEmpty()) {
            return new SinalListagem(cachedSinal.get(0));
        }

        Sinal sinal = sinalRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sinal não encontrado"));

        atualizarSinal(sinal);

        return new SinalListagem(sinal);
    }

    // ---------------- MÉTODOS AUXILIARES ----------------

    /** Gera uma chave de cache para a página */
    private String buildCacheKey(Pageable pageable, String baseKey) {
        return String.format("%s_%d_%d", baseKey, pageable.getPageNumber(), pageable.getPageSize());
    }

    /** Gera uma chave de cache para um sinal específico */
    private String buildSinalCacheKey(Long id) {
        return String.format("sinal_%d", id);
    }

    /** Salva uma lista de sinais no cache */
    private void cacheSinais(String cacheKey, List<Sinal> sinais) {
        sinalCache.put(cacheKey, sinais, CACHE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
    }

    /** Converte uma lista de sinais em um objeto paginado */
    private Page<SinalListagem> convertToPagedResponse(List<Sinal> sinais, Pageable pageable) {
        List<SinalListagem> sinalListagem = sinais.stream()
            .map(SinalListagem::new)
            .collect(Collectors.toList());

        return new PageImpl<>(sinalListagem, pageable, sinalListagem.size());
    }

    public Page<SinalListagem> getFilteredSinais(TipoEvento tipoEvento, Pageable pageable) {
        String cacheKey = buildCacheKey(pageable, "sinaisFiltered");

        // Tenta buscar do cache
        List<Sinal> cachedSinais = sinalCache.get(cacheKey);

        if (cachedSinais != null) {
            return convertToPagedResponse(cachedSinais, pageable);
        }

        // Caso não esteja no cache, buscar no banco
        Page<Sinal> sinaisPage = sinalRepository.findByTipoEvento(tipoEvento, pageable);

        // Salvar no cache
        cacheSinais(cacheKey, sinaisPage.getContent());

        return sinaisPage.map(SinalListagem::new);
    }

    public List<SinalListagem> getTop10() {
        String cacheKey = "SinalLast10";
    
        // Tenta buscar do cache
        List<Sinal> cachedSinais = sinalCache.get(cacheKey);
    
        if (cachedSinais != null && !cachedSinais.isEmpty()) {
            System.out.println("Cache hit: " + cachedSinais);
            return cachedSinais.stream().map(SinalListagem::new).toList();
        }
    
        // Caso não esteja no cache, buscar no banco
        List<Sinal> sinaisList = sinalRepository.findTop10ByOrderByCreatedAtDesc();
    
        if (sinaisList.isEmpty()) {
            System.out.println("No signals found in the database.");
            return List.of();
        }
    
        System.out.println("Cache miss. Saving new data to cache.");
    
        // Salvar no cache
        sinalCache.put(cacheKey, sinaisList, 20, TimeUnit.MINUTES);
    
        return sinaisList.stream().map(SinalListagem::new).toList();
    }
    
}
