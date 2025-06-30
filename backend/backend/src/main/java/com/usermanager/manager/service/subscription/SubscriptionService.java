package com.usermanager.manager.service.subscription;

import com.usermanager.manager.model.subscription.SubscriptionControl;
import com.usermanager.manager.model.user.User;

import jakarta.validation.constraints.NotNull;

public interface SubscriptionService {

    public SubscriptionControl createSubscriptionControl(@NotNull User user);

    public void updateSubscriptions();
}
