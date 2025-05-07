package com.usermanager.manager.repository.term;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.usermanager.manager.model.term.TermOfUse;
import com.usermanager.manager.model.term.UserTermAcceptance;
import com.usermanager.manager.model.user.User;

@Repository
public interface UserTermAcceptanceRepository extends JpaRepository<UserTermAcceptance, Long> {
    Optional<UserTermAcceptance> findByUserAndTermOfUse(User user, TermOfUse termOfUse);

    boolean existsByUserAndTermOfUse(User use, TermOfUse teermOfUse);

    Optional<UserTermAcceptance> findTopByUserOrderByAcceptedAtDesc(User user);
}
