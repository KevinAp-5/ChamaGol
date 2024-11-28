package com.chamagol.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import com.chamagol.enums.Status;
import com.chamagol.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long>{

    Page<Usuario> findByStatus(Status status, Pageable pageable);

    Optional<UserDetails> findByEmail(String email);

    boolean existsByEmail(String email);

}
