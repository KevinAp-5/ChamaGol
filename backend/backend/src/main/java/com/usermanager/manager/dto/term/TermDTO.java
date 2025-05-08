package com.usermanager.manager.dto.term;

import java.time.ZonedDateTime;

import com.usermanager.manager.model.term.TermOfUse;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TermDTO(
    @NotBlank String version,
    @NotBlank String content,
    @NotNull ZonedDateTime createdAt
) {
    public TermDTO(TermOfUse term) {
        this(term.getVersion(), term.getContent(), term.getCreatedAt());
    }
}
