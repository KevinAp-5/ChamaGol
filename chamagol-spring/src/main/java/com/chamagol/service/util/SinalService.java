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

    // Método para criar um novo sinal
    @Transactional
    public SinalListagem create(@Valid SinalDTO sinalDTO) {
        Sinal sinal = sinalMapper.toEntity(sinalDTO);
        sinalRepository.save(sinal);

        sinalCacheService.limparCache(); // Limpa o cache após criar um novo sinal

        topic.publish("SINAL_ADDED"); // Publica evento de criação
        return new SinalListagem(sinal);
    }

    // Recupera um sinal por ID, utilizando o cache
    public SinalListagem getSinalById(@Positive @NotNull Long id) {
        return sinalCacheService.getSinalById(id);
    }

    // Método para realizar soft delete em um sinal
    @Transactional
    public void delete(@NotNull @Positive Long id) {
        Sinal sinal = sinalRepository.findById(id)
                .orElseThrow(() -> new IDNotFoundException("Sinal não encontrado"));

        sinal.inactivate(); // Realiza soft delete
        sinalRepository.save(sinal);

        sinalCacheService.limparCache(); // Limpa o cache após deletar o sinal

        topic.publish("SINAL_DELETED"); // Publica evento de deleção
    }

    // Atualiza um sinal específico
    @Transactional
    public SinalListagem update(@Positive @NotNull Long id, @Valid SinalDTO sinalDTO) {
        Sinal sinal = sinalRepository.findById(id)
                .orElseThrow(() -> new IDNotFoundException("Sinal não encontrado"));

        sinalRepository.save(sinal);

        sinalCacheService.limparCache(); // Limpa o cache após a atualização

        topic.publish("SINAL_UPDATED"); // Publica evento de atualização
        return new SinalListagem(sinal);
    }

    // Obtém os 10 sinais mais recentes
    public List<SinalListagem> getLatestSignals() {
        return sinalCacheService.getTop10(); // Busca os 10 últimos sinais
    }

    // Inscreve-se em mudanças para enviar atualizações aos clientes
    public void subscribeToChanges(FluxSink<SinalListagem> sink) {
        topic.addListener(String.class, (channel, message) -> {
            // Atualizar o cliente com os sinais mais recentes
            List<SinalListagem> updatedSignals = getLatestSignals();
            updatedSignals.forEach(sink::next);
        });
    }
}
