package com.chamagol.dto.usuario;

import com.chamagol.dto.ApiResponse;
import com.chamagol.enums.Assinatura;
import com.chamagol.enums.Status;
import com.chamagol.model.Usuario;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioResponseEntityBody (

    @JsonProperty("id") Long id,

    @NotBlank String nome,

    @NotBlank @Email String email,

    Assinatura assinatura,

    Status status

)  implements ApiResponse{

    // Construtor para criar a resposta com os dados do usuário
    public UsuarioResponseEntityBody(Usuario usuario) {
        this(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getAssinatura(),
            usuario.getStatus());
    }

}
