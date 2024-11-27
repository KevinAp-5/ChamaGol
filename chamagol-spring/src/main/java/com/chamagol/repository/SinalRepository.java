package com.chamagol.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import com.chamagol.enums.Status;
import com.chamagol.model.Sinal;

@Repository
public interface SinalRepository extends JpaRepository<Sinal, Long> {
    Page<Sinal> findByStatus(Status status, Pageable pageable);

    @Query(
        value = "SELECT s FROM Sinal s WHERE s.status = 'ACTIVE' AND s.tipoEvento = :tipoEvento ORDER BY s.createdAt DESC"
    )
    Page<Sinal> findByTipoEvento(@Param("tipoEvento") String tipoEvento, Pageable pageable);
}
