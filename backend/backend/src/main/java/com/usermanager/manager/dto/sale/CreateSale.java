package com.usermanager.manager.dto.sale;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateSale(
    @NotBlank String name,
    @NotNull @Positive BigDecimal salePrice,
    @NotNull @Positive Integer userAmount,
    @Positive @NotNull Integer saleExpiration,
    @NotNull @Positive Integer userSubscriptionTime,
    @NotNull boolean userUnlimited
) {}
