package com.chamagol.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import com.chamagol.enums.Status;
import com.chamagol.model.Usuario;


public interface UsuarioRepository extends JpaRepository<Usuario, Long>{

    List<Usuario> findByStatus(Status status);

    Optional<UserDetails> findByEmail(String email);

    boolean existsByEmail(String email);

}
