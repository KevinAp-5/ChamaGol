package com.chamagol.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chamagol.model.UsuarioResetPassword;


public interface UsuarioResetTokenRepository extends JpaRepository<UsuarioResetPassword, Long> {
    Optional<UsuarioResetPassword> findByUuid(UUID uuid);

    Optional<UsuarioResetPassword> findByUsuarioId(Long id);
}
