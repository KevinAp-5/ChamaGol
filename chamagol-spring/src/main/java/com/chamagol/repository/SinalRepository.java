package com.chamagol.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chamagol.model.Sinal;
import java.util.List;
import com.chamagol.enums.Status;


public interface SinalRepository extends JpaRepository<Sinal, Long> {
    List<Sinal> findByStatus(Status status);
}
