package com.usermanager.manager.dto.payment;

public record WebhookResponse(
    int httpStatus,
    String bodyMessage
) {

}
