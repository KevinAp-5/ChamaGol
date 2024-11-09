package com.chamagol.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chamagol.model.UsuarioVerificadorEntity;

public interface UsuarioVerificadorRepository extends JpaRepository<UsuarioVerificadorEntity, Long>{
    Optional<UsuarioVerificadorEntity> findByUuid(UUID uuid);
}

    
