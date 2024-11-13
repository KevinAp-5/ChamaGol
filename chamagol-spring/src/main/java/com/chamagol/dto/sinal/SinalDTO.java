package com.chamagol.dto.sinal;

import java.time.LocalDateTime;

import com.chamagol.model.Sinal;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public record SinalDTO(

    @JsonProperty("id")
    Long id,

    @NotBlank
    String campeonato,

    @NotBlank
    String nomeTimes,

    @NotBlank
    String tempoPartida,

    @NotBlank
    String placar,

    @NotBlank
    String acaoSinal,

    LocalDateTime created_at

) {
    public SinalDTO(Sinal sinal) {
        this(
            sinal.getId(),
            sinal.getCampeonato(),
            sinal.getNomeTimes(),
            sinal.getTempoPartida(),
            sinal.getPlacar(),
            sinal.getPlacar(),
            sinal.getCreatedAt()
        );
    }
}
