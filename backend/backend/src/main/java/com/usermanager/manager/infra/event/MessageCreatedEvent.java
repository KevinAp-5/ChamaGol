package com.usermanager.manager.infra.event;

public record MessageCreatedEvent(Long messageId, String title, String message) {

}
