package com.usermanager.manager.model.webhook;

import java.time.LocalDateTime;

import com.usermanager.manager.model.webhook.enums.EventStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Table(name = "webhook_events")
@Entity
@Data
public class WebhookEvent {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "payload_json", columnDefinition = "TEXT")
    private String payloadJson;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "event_status")
    private EventStatus status; // PENDING, PROCESSED, ERROR
    
    private LocalDateTime receivedAt;
    private LocalDateTime processedAt;
    
    private Integer retryCount = 0;
    
}