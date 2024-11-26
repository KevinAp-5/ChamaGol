package com.chamagol.service.util;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.dto.util.TimelineResponse;
import com.chamagol.enums.TipoEvento;

@Service
public class TimelineService {
    private final SinalService sinalService;

    public TimelineService(SinalService sinalService) {
        this.sinalService = sinalService;
    }

    public List<TimelineResponse> getTimeline() {
        List<SinalListagem> sinais = sinalService.getSinalActive();

        // Converte para TimelineResponse
        return sinais.stream().map(TimelineResponse::new).collect(Collectors.toList());
    }

    public List<TimelineResponse> getFilteredTimeline(TipoEvento tipoEvento) {
        List<SinalListagem> sinais = sinalService.getFilteredSinais(tipoEvento);
        return sinais.stream().map(TimelineResponse::new).collect(Collectors.toList());
    }
}
