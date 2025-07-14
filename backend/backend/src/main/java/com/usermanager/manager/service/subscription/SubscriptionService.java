package com.usermanager.manager.service.subscription;

import java.time.ZonedDateTime;

import com.usermanager.manager.model.subscription.SubscriptionControl;
import com.usermanager.manager.model.user.User;

import jakarta.validation.constraints.NotNull;

// TODO: testar pagamento pendente -> pix no browser do google

// TODO: criar alert para o frontend do app quando tiver alert disponível
public interface SubscriptionService {

    public SubscriptionControl createSubscriptionControl(@NotNull User user);

    public void updateSubscriptions();

    public ZonedDateTime getExpirationDate(@NotNull User user);

    public Boolean verifyUserAlert(@NotNull User user);
}
