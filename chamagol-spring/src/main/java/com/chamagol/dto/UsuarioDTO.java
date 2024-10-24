package com.chamagol.dto;
import com.chamagol.enums.Assinatura;
import com.chamagol.enums.Status;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioDTO(

    @JsonProperty("id")
    Long id,

    @NotBlank
    String nome,

    @NotBlank
    @Email
    String email,

    @NotBlank
    String senha,

    @Enumerated
    Assinatura assinatura,

    @Enumerated
    Status status
){
    
}
