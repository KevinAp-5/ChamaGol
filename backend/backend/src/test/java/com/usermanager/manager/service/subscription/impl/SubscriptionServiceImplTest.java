package com.usermanager.manager.service.subscription.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.usermanager.manager.enums.Subscription;
import com.usermanager.manager.model.subscription.SubscriptionControl;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.repository.SubscriptionRepository;
import com.usermanager.manager.service.user.UserService;

class SubscriptionServiceImplTest {

    @Mock
    private UserService userService;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @InjectMocks
    private SubscriptionServiceImpl subscriptionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateSubscriptionControl() {
        User user = new User();
        SubscriptionControl control = new SubscriptionControl(user);

        when(subscriptionRepository.save(any(SubscriptionControl.class))).thenReturn(control);

        SubscriptionControl result = subscriptionService.createSubscriptionControl(user);

        assertNotNull(result);
        assertEquals(control, result);
        verify(subscriptionRepository, times(1)).save(any(SubscriptionControl.class));
    }

    @Test
    void testUpdateSubscriptions_withExpiredSubscriptions() {
        User user = new User();
        user.setSubscription(Subscription.PRO);
        SubscriptionControl expired = mock(SubscriptionControl.class);
        when(expired.getUserId()).thenReturn(user);

        List<SubscriptionControl> expiredList = List.of(expired);

        when(subscriptionRepository.findAllExpired(any(ZonedDateTime.class))).thenReturn(expiredList);

        // Chamada real do método
        subscriptionService.updateSubscriptions();

        // O usuário deve ser setado como FREE
        assertEquals(Subscription.FREE, user.getSubscription());
        verify(userService, times(1)).saveAll(anyList());
        verify(subscriptionRepository, times(1)).deleteAll(expiredList);
    }

    @Test
    void testUpdateSubscriptions_noExpiredSubscriptions() {
        when(subscriptionRepository.findAllExpired(any(ZonedDateTime.class))).thenReturn(List.of());

        subscriptionService.updateSubscriptions();

        verify(userService, times(1)).saveAll(argThat(iterable -> !iterable.iterator().hasNext()));
        verify(subscriptionRepository, times(1)).deleteAll(argThat(list -> !list.iterator().hasNext()));
    }

    @Test
    void testGetExpirationDate_found() {
        User user = new User();
        ZonedDateTime expiration = ZonedDateTime.now().plusDays(10);
        SubscriptionControl control = mock(SubscriptionControl.class);
        when(control.getExpirationDate()).thenReturn(expiration);

        when(subscriptionRepository.findByUserId(user)).thenReturn(Optional.of(control));

        ZonedDateTime result = subscriptionService.getExpirationDate(user);

        assertNotNull(result);
        assertEquals(expiration, result);
    }

    @Test
    void testGetExpirationDate_notFound() {
        User user = new User();
        when(subscriptionRepository.findByUserId(user)).thenReturn(Optional.empty());

        ZonedDateTime result = subscriptionService.getExpirationDate(user);

        assertNull(result);
    }
}