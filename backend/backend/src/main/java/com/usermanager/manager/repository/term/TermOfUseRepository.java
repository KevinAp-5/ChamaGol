package com.usermanager.manager.repository.term;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.usermanager.manager.model.term.TermOfUse;

@Repository
public interface TermOfUseRepository extends JpaRepository<TermOfUse, Long>{
    Optional<TermOfUse> findByVersion(String version);

    Optional<TermOfUse> findTopByOrderByCreatedAtDesc();

    boolean existsByVersion(String version);
}
