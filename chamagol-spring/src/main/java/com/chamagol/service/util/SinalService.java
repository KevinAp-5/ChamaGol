package com.chamagol.service.util;

import java.io.Serializable;
import java.util.List;

import org.redisson.api.RTopic;
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

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import reactor.core.publisher.FluxSink;

@Service
public class SinalService implements Serializable {

    private final transient SinalRepository sinalRepository;
    private final transient SinalMapper sinalMapper;
    private final transient SinalCacheService sinalCacheService;
    private final transient RTopic topic;

    public SinalService(SinalRepository sinalRepository, SinalMapper sinalMapper, SinalCacheService sinalCacheService,
            RTopic topic) {
        this.sinalRepository = sinalRepository;
        this.sinalMapper = sinalMapper;
        this.sinalCacheService = sinalCacheService;
        this.topic = topic;
    }

    public RTopic getTopic() {
        return topic;
    }

    public Page<SinalListagem> getSinal(Pageable pageable) {
        return sinalCacheService.getSinal(pageable);
    }

    public Page<SinalListagem> getSinalActive(Pageable pageable) {
        return sinalCacheService.getSinalActive(pageable);
    }

    public Page<SinalListagem> getFilteredSinais(TipoEvento tipoEvento, Pageable pageable) {
        return sinalCacheService.getFilteredSinais(tipoEvento, pageable);
    }

    @Transactional
    public SinalListagem create(@Valid SinalDTO sinalDTO) {
        Sinal sinal = sinalMapper.toEntity(sinalDTO);

        sinalRepository.save(sinal);

        sinalCacheService.limparCache();

        topic.publish("SINAL_ADDED");
        return new SinalListagem(sinal);
    }

    public SinalListagem getSinalById(@Positive @NotNull Long id) {
        return sinalCacheService.getSinalById(id);
    }

    @Transactional
    public void delete(@NotNull @Positive Long id) {
        Sinal sinal = sinalRepository.findById(id)
                .orElseThrow(() -> new IDNotFoundException("Sinal não encontrado"));

        sinal.inactivate();
        sinalRepository.save(sinal);

        sinalCacheService.limparCache();

        topic.publish("SINAL_DELETED");
    }

    @Transactional
    public SinalListagem update(@Positive @NotNull Long id, @Valid SinalDTO sinalDTO) {
        Sinal sinal = sinalRepository.findById(id)
                .orElseThrow(() -> new IDNotFoundException("Sinal não encontrado"));

        sinalRepository.save(sinal);

        sinalCacheService.limparCache();

        topic.publish("SINAL_UPDATED");
        return new SinalListagem(sinal);
    }

    public List<SinalListagem> getLatestSignals() {
        return sinalCacheService.getTop10();
    }

    public void subscribeToChanges(FluxSink<SinalListagem> sink) {
        topic.addListener(String.class, (channel, message) -> {
            List<SinalListagem> updatedSignals = getLatestSignals();
            updatedSignals.forEach(sink::next);
        });
    }
}
