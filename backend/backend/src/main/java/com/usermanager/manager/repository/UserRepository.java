package com.usermanager.manager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import com.usermanager.manager.enums.Status;
import com.usermanager.manager.enums.Subscription;
import com.usermanager.manager.model.user.User;

public interface UserRepository extends JpaRepository<User, Long>{

    Optional<UserDetails> findByLogin(String login);

    boolean existsByLogin(String login);

    Optional<User> findUserByLogin(String login);

    List<User> findAllBySubscription(Subscription subscription);

    List<User> findAllByStatus(Status status);
}
