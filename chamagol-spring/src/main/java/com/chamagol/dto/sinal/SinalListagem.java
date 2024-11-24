package com.chamagol.dto.sinal;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.chamagol.enums.TipoEvento;
import com.chamagol.model.Sinal;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

    @NotBlank
    @Enumerated(EnumType.STRING)
    TipoEvento tipoEvento,

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    LocalDateTime created_at
) implements Serializable {
    private static final long serialVersionUID = 1L;
    public SinalListagem(Sinal sinal) {
        this(
            sinal.getCampeonato(),
            sinal.getNomeTimes(),
            sinal.getTempoPartida(),
            sinal.getPlacar(),
            sinal.getAcaoSinal(),
            sinal.getTipoEvento(),
            sinal.getCreatedAt()
        );
    }
}
