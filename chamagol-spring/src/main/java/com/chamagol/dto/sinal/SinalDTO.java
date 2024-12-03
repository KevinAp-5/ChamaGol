package com.chamagol.dto.sinal;

import java.time.LocalDateTime;

import com.chamagol.dto.sinal.converter.TipoEventoConverter;
import com.chamagol.enums.TipoEvento;
import com.chamagol.model.Sinal;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Convert;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

    LocalDateTime created_at,

    @JsonProperty("tipoEvento")
    @Enumerated(EnumType.STRING)
    @Convert(converter = TipoEventoConverter.class)
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
