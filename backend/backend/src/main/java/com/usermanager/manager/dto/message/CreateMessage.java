package com.usermanager.manager.dto.message;

import com.google.firebase.database.annotations.NotNull;
import com.usermanager.manager.enums.People;

import jakarta.validation.constraints.NotBlank;

public record CreateMessage(@NotNull @NotBlank String content, @NotNull People people) {

}
