package com.chamagol.dto.util;

import java.time.LocalDateTime;

import com.chamagol.dto.sinal.SinalListagem;
import com.chamagol.enums.TipoEvento;
import com.chamagol.model.Sinal;

import lombok.Data;

@Data
public class TimelineResponse {
    private String campeonato;
    private String nomeTimes;
    private String placar;
    private String tempoPartida;
    private String acaoSinal;
    private TipoEvento tipoEvento;
    private LocalDateTime createdAt;

    public TimelineResponse(Sinal sinal) {
        this.campeonato = sinal.getCampeonato();
        this.nomeTimes = sinal.getNomeTimes();
        this.placar = sinal.getPlacar();
        this.tempoPartida = sinal.getTempoPartida();
        this.acaoSinal = sinal.getAcaoSinal();
        this.tipoEvento = sinal.getTipoEvento();
        this.createdAt = sinal.getCreatedAt();
    }

    public TimelineResponse(SinalListagem sinal) {
        this.campeonato = sinal.campeonato();
        this.nomeTimes = sinal.nomeTimes();
        this.placar = sinal.placar();
        this.tempoPartida = sinal.tempoPartida();
        this.acaoSinal = sinal.acaoSinal();
        this.tipoEvento = sinal.tipoEvento();
        this.createdAt = sinal.created_at();
    }

}
