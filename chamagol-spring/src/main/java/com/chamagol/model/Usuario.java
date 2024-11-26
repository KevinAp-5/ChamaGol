package com.chamagol.model;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.hibernate.validator.constraints.Length;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioUpdate;
import com.chamagol.enums.Assinatura;
import com.chamagol.enums.Roles;
import com.chamagol.enums.Status;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
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
import lombok.AccessLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "usuario")
@Entity(name = "usuarios")

@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Usuario implements UserDetails {

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
    @Column(length = 100, nullable = false, unique = true)
    private String email;

    @Length(min = 8, max = 200)
    private String senha;

    @NotNull
    @Column(length = 100, nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status = Status.INACTIVE;

    @NotNull
    @Column(length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    @Getter(AccessLevel.NONE)
    private Roles role = Roles.USER;

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

    // Implementação do contrato de UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == Roles.ADMIN) {
            return List.of(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("ROLE_MESTRE"), // Herdando permissões de MESTRE
                new SimpleGrantedAuthority("ROLE_USER")   // Herdando permissões de USER
            );
        }

        if (this.role == Roles.MESTRE) {
            return List.of(
                new SimpleGrantedAuthority("ROLE_MESTRE"),
                new SimpleGrantedAuthority("ROLE_USER")   // Herdando permissões de USER
            );
        }

        // Padrão para usuários regulares
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    public void setAuthorities(List<SimpleGrantedAuthority> authoritiesList) {
        List<String> roles = authoritiesList.stream()
        .map(GrantedAuthority::getAuthority)
        .collect(Collectors.toList());

        if (roles.contains("ROLE_MESTRE")) {
            this.setRole(Roles.MESTRE);
        } else if (roles.contains("ROLE_ADMIN")) {
            this.setRole(Roles.ADMIN);
        } else {
            this.setRole(Roles.USER);
        }
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Implementar lógica, se necessário
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Implementar lógica, se necessário
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Implementar lógica, se necessário
    }

    @Override
    public boolean isEnabled() {
        return this.status == Status.ACTIVE;
    }
}