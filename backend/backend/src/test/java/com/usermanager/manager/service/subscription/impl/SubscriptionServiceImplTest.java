package com.usermanager.manager.service.subscription.impl;

import com.usermanager.manager.enums.Subscription;
import com.usermanager.manager.model.subscription.SubscriptionControl;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.repository.SubscriptionRepository;
import com.usermanager.manager.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SubscriptionServiceImplTest {

    private UserService userService;
    private SubscriptionRepository subscriptionRepository;
    private SubscriptionServiceImpl subscriptionService;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        subscriptionRepository = mock(SubscriptionRepository.class);
        subscriptionService = new SubscriptionServiceImpl(userService, subscriptionRepository);
    }

    @Test
    void testCreateSubscriptionControl() {
        User user = mock(User.class);
        SubscriptionControl subscriptionControl = new SubscriptionControl(user);

        when(subscriptionRepository.save(any(SubscriptionControl.class))).thenReturn(subscriptionControl);

        SubscriptionControl result = subscriptionService.createSubscriptionControl(user);

        assertNotNull(result);
        assertEquals(subscriptionControl, result);
        verify(subscriptionRepository, times(1)).save(any(SubscriptionControl.class));
    }

    @Test
    void testUpdateSubscriptions() {
        User user1 = mock(User.class);
        User user2 = mock(User.class);

        SubscriptionControl sub1 = mock(SubscriptionControl.class);
        SubscriptionControl sub2 = mock(SubscriptionControl.class);

        when(sub1.getUserId()).thenReturn(user1);
        when(sub2.getUserId()).thenReturn(user2);

        List<SubscriptionControl> expiredSubs = Arrays.asList(sub1, sub2);

        when(subscriptionRepository.findAllExpired(any(ZonedDateTime.class))).thenReturn(expiredSubs);

        subscriptionService.updateSubscriptions();

        verify(user1, times(1)).setSubscription(Subscription.FREE);
        verify(user2, times(1)).setSubscription(Subscription.FREE);

        ArgumentCaptor<List<User>> usersCaptor = ArgumentCaptor.forClass(List.class);
        verify(userService, times(1)).saveAll(usersCaptor.capture());
        List<User> savedUsers = usersCaptor.getValue();
        assertTrue(savedUsers.contains(user1));
        assertTrue(savedUsers.contains(user2));

        verify(subscriptionRepository, times(1)).deleteAll(expiredSubs);
    }
}