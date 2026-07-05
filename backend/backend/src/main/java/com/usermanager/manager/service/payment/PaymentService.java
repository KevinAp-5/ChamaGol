package com.usermanager.manager.service.payment;

import com.usermanager.manager.dto.payment.PreferenceResponse;
import com.usermanager.manager.dto.payment.UserSubscriptionResponse;
import com.usermanager.manager.dto.payment.WebhookRequest;
import com.usermanager.manager.dto.payment.WebhookResponse;

public interface PaymentService {
    public WebhookResponse createPaymentProcessing(WebhookRequest request);
    public UserSubscriptionResponse getUserSubscription(Long id);
    public PreferenceResponse createPayment(Long id);
}
