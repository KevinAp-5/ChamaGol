package com.usermanager.manager.dto.sale;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateSale(
    @NotBlank String name,
    @NotNull @Positive BigDecimal salePrice,
    @NotNull @Positive Integer userAmount,
    ZonedDateTime saleExpiration,
    @NotNull @Positive Integer userSubscriptionTime,
    @NotNull boolean userUnlimited
) {}
