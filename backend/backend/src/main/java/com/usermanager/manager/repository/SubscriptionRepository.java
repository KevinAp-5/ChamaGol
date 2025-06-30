package com.usermanager.manager.repository;

import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.usermanager.manager.model.subscription.SubscriptionControl;

public interface SubscriptionRepository extends JpaRepository<SubscriptionControl, Long>{

    @Query("SELECT s from SubscriptionControl s WHERE s.expirationDate < :date")
    List<SubscriptionControl> findAllExpired(ZonedDateTime actualDate);
}
