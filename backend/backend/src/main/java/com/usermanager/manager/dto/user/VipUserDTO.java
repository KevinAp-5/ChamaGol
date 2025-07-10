package com.usermanager.manager.dto.user;

import java.time.ZonedDateTime;

import com.usermanager.manager.model.subscription.SubscriptionControl;

public record VipUserDTO(Long id, String name, String login, ZonedDateTime purchaseDate,
        ZonedDateTime expirationDate) {
    public VipUserDTO(SubscriptionControl subscriptionControl) {
        this(subscriptionControl.getUserId().getId(), subscriptionControl.getUserId().getName(),
                subscriptionControl.getUserId().getLogin(),
                subscriptionControl.getPurchaseDate(), subscriptionControl.getExpirationDate());
    }
}