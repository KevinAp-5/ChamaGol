package com.chamagol.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.chamagol.enums.Status;
import com.chamagol.model.Sinal;

public interface SinalRepository extends JpaRepository<Sinal, Long> {
    List<Sinal> findByStatus(Status status);

    @Query(
        value = "SELECT * FROM sinal WHERE status = 'ACTIVE' AND tipo_evento = :tipoEvento ORDER BY created_at DESC;",
        nativeQuery = true
    )
    List<Sinal> findByTipoEvento(@Param("tipoEvento") String tipoEvento);

}
