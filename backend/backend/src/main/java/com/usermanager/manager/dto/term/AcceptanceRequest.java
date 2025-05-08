package com.usermanager.manager.dto.term;

import jakarta.validation.constraints.NotNull;

public record AcceptanceRequest(@NotNull Boolean isAdult) {

}
