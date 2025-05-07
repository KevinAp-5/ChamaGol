package com.usermanager.manager.dto.term;

import jakarta.validation.constraints.NotBlank;

public record CreateTermRequest(@NotBlank String version, @NotBlank String content) {

}
