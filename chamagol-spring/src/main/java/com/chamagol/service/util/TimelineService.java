package com.chamagol.service.util;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.chamagol.dto.util.TimelineResponse;
import com.chamagol.enums.TipoEvento;

@Service
public class TimelineService {
    private final SinalService sinalService;

    public TimelineService(SinalService sinalService) {
        this.sinalService = sinalService;
    }

    public Page<TimelineResponse> getTimeline(Pageable pageable) {
        return sinalService.getSinalActive(pageable).map(TimelineResponse:: new);
    }

    public Page<TimelineResponse> getFilteredTimeline(TipoEvento tipoEvento, Pageable pageable) {
        return sinalService.getFilteredSinais(tipoEvento, pageable).map(TimelineResponse:: new);
    }
}
