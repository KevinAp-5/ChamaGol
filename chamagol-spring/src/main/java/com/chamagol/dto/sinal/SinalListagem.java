package com.chamagol.dto.sinal;

import java.time.LocalDateTime;

import com.chamagol.model.Sinal;

import jakarta.validation.constraints.NotBlank;

public record SinalListagem(
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
    public SinalListagem(Sinal sinal) {
        this(
            sinal.getCampeonato(),
            sinal.getNomeTimes(),
            sinal.getTempoPartida(),
            sinal.getPlacar(),
            sinal.getPlacar(),
            sinal.getCreatedAt()
        );
    }
}
