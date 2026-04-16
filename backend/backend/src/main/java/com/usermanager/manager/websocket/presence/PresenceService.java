package com.usermanager.manager.websocket.presence;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PresenceService {

    private final Map<Long, Instant> lastSeenMap = new ConcurrentHashMap<>();

    private static final long TIMEOUNT_SECONDS = 30;

    public void markOnline(Long userId) {
        this.lastSeenMap.put(userId, Instant.now());
    }

    public void markOffline(Long userId) {
        this.lastSeenMap.remove(userId);
    }

    public void heartbeat(Long userId) {
        this.lastSeenMap.put(userId, Instant.now());
        log.info("heartbeat userId: {}", userId);
    }

    public boolean isOnline(Long userId) {
        Instant lastSeen = lastSeenMap.get(userId);

        if (lastSeen == null) return false;

        return lastSeen.isAfter(Instant.now().minusSeconds(TIMEOUNT_SECONDS));
    }
}
