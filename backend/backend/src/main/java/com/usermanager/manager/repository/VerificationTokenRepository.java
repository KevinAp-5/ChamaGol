package com.usermanager.manager.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.verification.VerificationToken;


@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID>{

    @Query("SELECT vt FROM VerificationToken vt WHERE vt.user = ?1 ORDER BY vt.creationDate DESC FETCH first 1 rows only")
    Optional<VerificationToken> findByUserMostRecent(User user);

}
