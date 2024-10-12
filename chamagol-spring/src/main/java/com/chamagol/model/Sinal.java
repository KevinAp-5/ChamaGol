package com.chamagol.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "sinal")
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Sinal {

    @NotNull
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("_id")
    private Long id;

    @NotBlank
    private String campeonato;

    @NotBlank
    private String times;

    @NotBlank
    private String tempoPartida;

    @NotBlank
    private String placar;

    @NotBlank
    private String acaoSinal;

}
