package com.chamagol.model;

import com.chamagol.enums.Assinatura;
import com.chamagol.enums.Status;
import com.chamagol.enums.converters.StatusConverter;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.hibernate.annotations.SQLRestriction;
import org.hibernate.validator.constraints.Length;

import com.chamagol.dto.UsuarioDTO;
import com.chamagol.dto.UsuarioUpdate;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Table(name = "usuario")
@Entity(name = "usuarios")

@SQLRestriction("status = 'Active'")
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario {

    public Usuario(UsuarioDTO usuario) {
        this.nome = usuario.nome();
        this.email = usuario.email();
        this.senha = usuario.senha();
        this.assinatura = usuario.assinatura();
        this.status = Status.ACTIVE;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("_id")
    private Long id;

    @NotBlank
    @Length(min = 2, max = 100)
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Length(min = 5, max = 100)
    @Column(length = 100, nullable = false)
    private String email;

    @Length(min = 8, max = 100)
    private String senha;

    @NotNull
    @Column(length = 100, nullable = false)
    @Convert(converter = StatusConverter.class)
    private Status status = Status.ACTIVE;

    @NotNull
    @Column(length = 24, nullable = false)
    @Enumerated(EnumType.STRING)
    private Assinatura assinatura;

    public void updateUsuario(@Valid UsuarioUpdate usuarioUpdate) {
        if (usuarioUpdate.nome() != null) {
            this.nome = usuarioUpdate.nome();
        }

        if (usuarioUpdate.email() != null) {
            this.email = usuarioUpdate.email();
        }
    }

    public void inactiveUsario() {
        this.status = Status.INACTIVE;
    } 
}
