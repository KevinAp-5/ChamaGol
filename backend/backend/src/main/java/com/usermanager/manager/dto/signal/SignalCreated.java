package com.usermanager.manager.dto.signal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SignalCreated(
        @NotNull @Positive Long id,
        @NotBlank String campeonato,
        @NotBlank String nomeTimes,
        @NotBlank String tempoPartida,
        @NotBlank String placar,
        @NotBlank String acaoSinal) {

}
