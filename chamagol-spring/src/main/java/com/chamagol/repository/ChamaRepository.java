package com.chamagol.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chamagol.model.Usuario;
public interface ChamaRepository extends JpaRepository<Usuario, Long>{

}
