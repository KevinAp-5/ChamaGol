package com.usermanager.manager.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.model.security.RefreshToken;
import com.usermanager.manager.model.user.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);

    boolean existsByToken(String token);

    List<RefreshToken> findAllByUserId(Long userId);

    void deleteByUser(User user);

    void deleteByToken(String token);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.used = true OR rt.createdAt < :threshold")
    void deleteAllUsedAndExpired(Instant threshold);
}
