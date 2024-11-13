package com.chamagol.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
    @Column(nullable = false)
    private String acaoSinal;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
