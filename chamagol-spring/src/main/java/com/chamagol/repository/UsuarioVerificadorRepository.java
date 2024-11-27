package com.chamagol.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chamagol.model.UsuarioVerificadorEntity;

@Repository
public interface UsuarioVerificadorRepository extends JpaRepository<UsuarioVerificadorEntity, Long>{
    Optional<UsuarioVerificadorEntity> findByUuid(UUID uuid);

    Optional<UsuarioVerificadorEntity> findByUsuarioId(Long idUsuario);
}

    
