package com.chamagol.dto.usuario;

import com.chamagol.enums.Assinatura;
import com.chamagol.enums.Status;
import com.chamagol.model.Usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioResponseEntityBody (

    @NotBlank String nome,

    @NotBlank @Email String email,

    Assinatura assinatura,

    Status status

) {

    // Construtor para criar a resposta com os dados do usuário
    public UsuarioResponseEntityBody(Usuario usuario) {
        this(
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getAssinatura(),
            usuario.getStatus());
    }

}
