package com.chamagol.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chamagol.model.ControleEmail;

public interface ControleEmailRepository extends JpaRepository<ControleEmail, Long>{

    Optional<ControleEmail> findByIdUsuario(Long id);

}
