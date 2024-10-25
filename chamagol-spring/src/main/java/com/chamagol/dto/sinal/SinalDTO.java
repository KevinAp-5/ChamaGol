package com.chamagol.dto.sinal;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public record SinalDTO(
    @JsonProperty("id")

    Long id,

    @NotBlank
    String campeonato,

    @NotBlank
    String times,

    @NotBlank
    String tempoPartida,

    @NotBlank
    String placar,

    @NotBlank
    String acaoSinal

) {
}
