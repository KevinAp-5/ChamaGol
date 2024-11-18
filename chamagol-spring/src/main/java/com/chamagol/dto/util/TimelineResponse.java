package com.chamagol.dto.util;

import java.time.LocalDateTime;

import com.chamagol.enums.TipoEvento;
import com.chamagol.model.Sinal;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(of = "id")
public class TimelineResponse {
    private Long id;
    private String campeonato;
    private String nomeTimes;
    private String placar;
    private String tempoPartida;
    private String acaoSinal;
    private TipoEvento tipoEvento;
    private LocalDateTime createdAt;

    public TimelineResponse(Sinal sinal) {
        this.id = sinal.getId();
        this.campeonato = sinal.getCampeonato();
        this.nomeTimes = sinal.getNomeTimes();
        this.placar = sinal.getPlacar();
        this.tempoPartida = sinal.getTempoPartida();
        this.acaoSinal = sinal.getAcaoSinal();
        this.tipoEvento = sinal.getTipoEvento();
        this.createdAt = sinal.getCreatedAt();
    }
}
