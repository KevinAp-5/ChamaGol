package com.usermanager.manager.model.signal;

import java.time.ZonedDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.usermanager.manager.enums.Status;
import com.usermanager.manager.enums.TipoEvento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "signals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Signal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campeonato;

    private String nomeTimes;

    private String tempoPartida;

    private String placar;

    private String acaoSinal;

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TipoEvento tipoEvento = TipoEvento.DICA;

    // TODO: implementar a regra de negócios para não mostrar os sinais PRO para usuários free
}
