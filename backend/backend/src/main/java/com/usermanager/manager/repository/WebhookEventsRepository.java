package com.usermanager.manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.usermanager.manager.model.webhook.WebhookEvent;
import com.usermanager.manager.model.webhook.enums.EventStatus;

@Repository
public interface WebhookEventsRepository extends JpaRepository<WebhookEvent, Long>{

    List<WebhookEvent> findByStatusAndRetryCountLessThan(EventStatus status, Integer retryCount);
}
