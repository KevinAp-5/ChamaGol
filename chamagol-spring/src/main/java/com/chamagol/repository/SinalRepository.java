package com.chamagol.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.chamagol.enums.Status;
import com.chamagol.enums.TipoEvento;
import com.chamagol.model.Sinal;

@Repository
public interface SinalRepository extends JpaRepository<Sinal, Long> {
    Page<Sinal> findByStatus(Status status, Pageable pageable);

    @Query(
        value = "SELECT s FROM Sinal s WHERE s.status = 'ACTIVE' AND s.tipoEvento = :tipoEvento ORDER BY s.createdAt DESC"
    )
    Page<Sinal> findByTipoEvento(@Param("tipoEvento") TipoEvento tipoEvento, Pageable pageable);


    @Query(
        value = "SELECT s FROM Sinal s WHERE s.status = 'ACTIVE' ORDER BY s.id DESC FETCH FIRST 10 ROWS ONLY"
    )
    List<Sinal> findTop10ByOrderByCreatedAtDesc();
}
