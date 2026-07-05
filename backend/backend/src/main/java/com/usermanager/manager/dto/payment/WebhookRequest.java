package com.usermanager.manager.dto.payment;

import java.util.Map;

public record WebhookRequest(
    String xSignature,
    String xRequestId,
    Map<String, String> queryParams,
    Map<String, Object> payload
    ) {

}
