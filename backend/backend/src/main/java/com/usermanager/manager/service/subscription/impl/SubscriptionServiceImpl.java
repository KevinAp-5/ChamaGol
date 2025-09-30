package com.usermanager.manager.service.subscription.impl;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.enums.Subscription;
import com.usermanager.manager.model.subscription.SubscriptionControl;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.repository.SubscriptionRepository;
import com.usermanager.manager.service.subscription.SubscriptionService;
import com.usermanager.manager.service.user.UserService;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {
    private UserService userService;
    private SubscriptionRepository subscriptionRepository;

    public SubscriptionServiceImpl(UserService userService, SubscriptionRepository subscriptionRepository) {
        this.userService = userService;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Override
    public SubscriptionControl createSubscriptionControl(@NotNull User user) {
        var subscription = new SubscriptionControl(user);
        return subscriptionRepository.save(subscription);
    }

    @Override
    public SubscriptionControl createSubscriptionControl(@NotNull User user, @Positive @NotNull int SubscriptionDays) {
        var subscription = new SubscriptionControl(user);
        subscription.setExpirationDate(ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")).plusDays(SubscriptionDays));
        return subscriptionRepository.save(subscription);
    }

    @Override
    @Transactional
    public void updateSubscriptions () {
        List<SubscriptionControl> expiredSubscription = subscriptionRepository.findAllExpired(ZonedDateTime.now());
        expiredSubscription.forEach(s -> s.getUserId().setSubscription(Subscription.FREE));

        List<User> users = expiredSubscription.stream().map(s -> s.getUserId()).toList();
        userService.saveAll(users);
        subscriptionRepository.deleteAll(expiredSubscription);
    }

    @Override
    public ZonedDateTime getExpirationDate(@NotNull User user) {
        Optional<SubscriptionControl> subscriptionControl = subscriptionRepository.findByUserId(user);
        if (subscriptionControl.isPresent()) {
            return subscriptionControl.get().getExpirationDate();
        }
        return null;
    }

    @Override
    public Boolean verifyUserAlert(@NotNull User user) {
        Optional<SubscriptionControl> subscriptionControl = subscriptionRepository.findByUserId(user);
        if (subscriptionControl.isEmpty()) {
            return false;
        }
        return subscriptionControl.get().isExpirationAlert();

    }

    @Override
    @Scheduled(cron = "@midnight")
    public void updateAllAlerts() {
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime daysAhead = now.plusDays(5);
        List<SubscriptionControl> expiringSoon = subscriptionRepository.findBySubscriptionEnding(now, daysAhead);
        System.out.println("expiringSoon:");
        expiringSoon.forEach(System.out::println);
        expiringSoon.forEach(s -> s.setExpirationAlert(true));
        subscriptionRepository.saveAll(expiringSoon);
    }

    @Override
    @Scheduled(cron = "@daily")
    public void cleanExpiredSubscriptions() {
        List<SubscriptionControl> expiredSubcriptions = subscriptionRepository.findExpiredSubscription(ZonedDateTime.now());
        List<User> users = expiredSubcriptions.stream()
        .map(s -> s.getUserId())
        .toList();
        System.out.println("users:");
        users.forEach(System.out::println);

        updateUsersSubscription(users);
        subscriptionRepository.deleteAll(expiredSubcriptions);
    }

    private void updateUsersSubscription(List<User> users) {
        users.forEach(user -> user.setSubscription(Subscription.FREE));
        userService.saveAll(users);
    }
}
