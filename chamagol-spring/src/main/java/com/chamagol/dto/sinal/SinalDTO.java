package com.chamagol.dto.sinal;

import java.time.LocalDateTime;

import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;

import com.chamagol.enums.TipoEvento;
import com.chamagol.model.Sinal;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;

@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO )
public record SinalDTO(
    @JsonProperty("id")
    Long id,

    @NotNull
    String campeonato,
    @NotNull
    String nomeTimes,
    @NotNull
    String tempoPartida,
    @NotNull
    String placar,
    @NotNull
    String acaoSinal,

    LocalDateTime created_at,

    @NotNull
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