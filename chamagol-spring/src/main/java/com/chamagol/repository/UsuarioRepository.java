package com.chamagol.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import com.chamagol.model.Usuario;
import com.chamagol.enums.Status;


public interface UsuarioRepository extends JpaRepository<Usuario, Long>{

    List<Usuario> findByStatus(Status status);

    UserDetails findByEmail(String nome);

    boolean existsByEmail(String email);
}
