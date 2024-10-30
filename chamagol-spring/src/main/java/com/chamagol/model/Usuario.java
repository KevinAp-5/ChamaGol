package com.chamagol.model;

import java.util.Collection;
import java.util.List;

import org.hibernate.validator.constraints.Length;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioUpdate;
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
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Table(name = "usuario")
@Entity(name = "usuarios")

@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario implements UserDetails{

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

    @Length(min = 8, max = 200)
    private String senha;

    @Column(name = "resettoken")
    private String resetToken;

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

    public void inactivateUsario() {
        this.status = Status.INACTIVE;

    }

    public void activateUsuario() {
        this.status = Status.ACTIVE;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.senha;
        
    }

    @Override
    public String getUsername() {
        return this.email;
    }
}
