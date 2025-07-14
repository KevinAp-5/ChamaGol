package com.usermanager.manager.repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.usermanager.manager.model.subscription.SubscriptionControl;
import com.usermanager.manager.model.user.User;

public interface SubscriptionRepository extends JpaRepository<SubscriptionControl, Long>{

    @Query("SELECT s from SubscriptionControl s WHERE s.expirationDate < :date")
    List<SubscriptionControl> findAllExpired(ZonedDateTime actualDate);

    Optional<SubscriptionControl> findByUserId(User user);

    @Query("SELECT s from SubscriptionControl s WHERE s.expirationDate BETWEEN :now AND :threeDaysAhead")
    List<SubscriptionControl> findBySubscriptionEnding(@Param("now") ZonedDateTime now, @Param("ThreeDaysAhead") ZonedDateTime threeDaysAhead);

    @Query("SELECT s from SubscriptionControl s WHERE s.expirationDate < :today")
    List<SubscriptionControl> findExpiredSubscription(@Param("today") ZonedDateTime today);
}
