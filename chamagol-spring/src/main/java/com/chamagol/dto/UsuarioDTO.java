package com.chamagol.dto;
import com.chamagol.enums.Assinatura;

public record UsuarioDTO(
    String nome,
    String email,
    String senha,
    Assinatura plano
) {

}
