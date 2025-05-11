package com.usermanager.manager.dto.signal;

import com.usermanager.manager.enums.TipoEvento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SignalDTO(
    @NotNull @Positive Long id,
    @NotBlank String campeonato, 
    @NotBlank String nomeTimes, 
    @NotBlank String tempoPartida, 
    @NotBlank String placar, 
    @NotBlank String acaoSinal,
    @NotNull TipoEvento tipoEvento) {

}
