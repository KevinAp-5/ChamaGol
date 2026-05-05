package com.usermanager.manager.dto.device;

import jakarta.validation.constraints.NotBlank;

public record RegisterDeviceRequest(@NotBlank String token, @NotBlank String platform) {

}
