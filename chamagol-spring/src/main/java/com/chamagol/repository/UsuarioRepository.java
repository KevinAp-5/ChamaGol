package com.chamagol.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.chamagol.enums.Status;
import com.chamagol.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long>{

    Page<Usuario> findByStatus(Status status, Pageable pageable);

    Optional<UserDetails> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Usuario> findIdByEmail(String email);

    @Query("SELECT u.id FROM Usuario u WHERE u.status = 'INACTIVE' AND u.createdAt <= :startDate")
    Page<Long> findInactiveUsersId(@Param("startDate")Instant startDate, Pageable pageable);

    @Transactional
    @Modifying
    @Query("DELETE FROM Usuario u WHERE u.id IN :usersId ")
    void deleteMultipleInativeUsersById(@Param("usersId")List<Long> usersId);
}
