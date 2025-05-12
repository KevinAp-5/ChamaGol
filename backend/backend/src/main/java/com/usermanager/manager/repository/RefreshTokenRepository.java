package com.usermanager.manager.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.usermanager.manager.model.security.RefreshToken;
import com.usermanager.manager.model.user.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);

    boolean existsByToken(String token);

    List<RefreshToken> findAllByUserId(Long userId);

    void deleteByUser(User user);

    void deleteByToken(String token);
}
