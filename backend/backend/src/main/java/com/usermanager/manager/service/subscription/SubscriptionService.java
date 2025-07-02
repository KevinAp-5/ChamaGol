package com.usermanager.manager.service.subscription;

import java.time.ZonedDateTime;

import com.usermanager.manager.model.subscription.SubscriptionControl;
import com.usermanager.manager.model.user.User;

import jakarta.validation.constraints.NotNull;

public interface SubscriptionService {

    public SubscriptionControl createSubscriptionControl(@NotNull User user);

    public void updateSubscriptions();

    public ZonedDateTime getExpirationDate(@NotNull User user);
}
