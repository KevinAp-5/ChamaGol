package com.chamagol.dto;
import com.chamagol.enums.Assinatura;

public record UsuarioDTO(
    Long id,
    String nome,
    String email,
    String password,
    Assinatura assinatura
){

}
