package com.usermanager.manager.dto.term;

import java.time.ZonedDateTime;

import com.usermanager.manager.model.term.TermOfUse;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TermAcceptedResponse(
        @NotNull TermOfUse term,
        @NotNull Boolean isAdult,
        @NotNull ZonedDateTime acceptedAt,
        @NotBlank String userEmail) {

}
