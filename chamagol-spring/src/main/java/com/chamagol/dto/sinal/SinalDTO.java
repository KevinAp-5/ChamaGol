package com.chamagol.dto.sinal;

import java.time.LocalDateTime;
import com.chamagol.enums.TipoEvento;
import com.chamagol.model.Sinal;
import com.fasterxml.jackson.annotation.JsonProperty;

public record SinalDTO(
    @JsonProperty("id")
    Long id,

    String campeonato,
    String nomeTimes,
    String tempoPartida,
    String placar,
    String acaoSinal,
    LocalDateTime created_at,

    @JsonProperty("tipoEvento")
    TipoEvento tipoEvento
) {
    public SinalDTO(Sinal sinal) {
        this(
            sinal.getId(),
            sinal.getCampeonato(),
            sinal.getNomeTimes(),
            sinal.getTempoPartida(),
            sinal.getPlacar(),
            sinal.getAcaoSinal(),
            sinal.getCreatedAt(),
            sinal.getTipoEvento()
        );
    }
}