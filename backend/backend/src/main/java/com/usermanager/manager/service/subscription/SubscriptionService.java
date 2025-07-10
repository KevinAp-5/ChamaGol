package com.usermanager.manager.service.subscription;

import java.time.ZonedDateTime;

import com.usermanager.manager.model.subscription.SubscriptionControl;
import com.usermanager.manager.model.user.User;

import jakarta.validation.constraints.NotNull;
// TODO: Criar Scheduler para atualizar assinaturas
// TODO: Criar Schedular para limpar assinaturas expiradas
// TODO: Criar scheduler para altera o estado do alert de assinatura expirando
// TODO: testar pagamento pendente -> pix no browser do google
public interface SubscriptionService {

    public SubscriptionControl createSubscriptionControl(@NotNull User user);

    public void updateSubscriptions();

    public ZonedDateTime getExpirationDate(@NotNull User user);
}
