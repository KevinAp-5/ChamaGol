package com.chamagol.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.dto.util.TimelineResponse;
import com.chamagol.enums.TipoEvento;
import com.chamagol.model.Sinal;
import com.chamagol.repository.SinalRepository;

@Service
public class TimelineService {
    private final SinalRepository sinalRepository;
    private final SinalService sinalService;

    public TimelineService(SinalRepository sinalRepository, SinalService sinalService) {
        this.sinalRepository = sinalRepository;
        this.sinalService = sinalService;
    }

    public List<TimelineResponse> getTimeline() {
        List<SinalListagem> sinais = sinalService.getSinalActive();

        // Converte para TimelineResponse
        return sinais.stream().map(TimelineResponse::new).collect(Collectors.toList());
    }

    public List<TimelineResponse> getFilteredTimeline(TipoEvento tipoEvento) {
        List<Sinal> sinais = sinalRepository.findByTipoEvento(tipoEvento.getTipo());
        return sinais.stream().map(TimelineResponse::new).collect(Collectors.toList());
    }
}
