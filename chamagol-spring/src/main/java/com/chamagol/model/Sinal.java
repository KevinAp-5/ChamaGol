package com.chamagol.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.validator.constraints.Length;

import com.chamagol.enums.Status;
import com.chamagol.enums.TipoEvento;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@Table(name = "Sinal")
@Entity(name = "sinais")
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Sinal {

    @JsonProperty("_id")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Length(min = 2, max = 255)
    @Column(nullable = false)
    private String campeonato;

    @Length(min = 2, max = 255)
    @Column(nullable = false)
    private String nomeTimes;

    @NotBlank
    @Length(min = 2, max = 255)
    @Column(nullable = false)
    private String tempoPartida;

    @NotBlank
    @Length(min = 2, max = 255)
    @Column(nullable = false)
    private String placar;

    @NotBlank
    @Length(min = 2, max = 255)
    @Column(name = "acao_sinal", nullable = false)
    private String acaoSinal;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Column(name = "tipo_evento", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoEvento tipoEvento = TipoEvento.DICA;

    public void activate() {
        this.status = Status.ACTIVE;
    }

    public void inactivate() {
        this.status = Status.INACTIVE;
    }
}
