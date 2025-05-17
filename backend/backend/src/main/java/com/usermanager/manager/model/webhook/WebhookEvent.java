package com.usermanager.manager.model.webhook;

import java.time.ZonedDateTime;

import com.usermanager.manager.model.webhook.enums.EventStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@Table(name = "webhook_events")
@Entity(name = "webhook_events")
@AllArgsConstructor
@NoArgsConstructor
public class WebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "webhook_events_seq_gen")
    @SequenceGenerator(name = "webhook_events_seq_gen", sequenceName = "webhook_events_seq", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    @Column(name = "payload_json", columnDefinition = "TEXT")
    private String payloadJson;
    
    @Column(name = "event_status")
    @Enumerated(EnumType.STRING)
    private EventStatus status; // PENDING, PROCESSED, ERROR
    
    private ZonedDateTime receivedAt;
    private ZonedDateTime processedAt;
    
    @Builder.Default
    private Integer retryCount = 0;
    
}