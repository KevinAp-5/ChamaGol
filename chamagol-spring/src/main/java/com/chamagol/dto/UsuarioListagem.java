package com.chamagol.dto;

import com.chamagol.enums.Assinatura;
import com.chamagol.model.Usuario;

public record UsuarioListagem(
    String nome,
    String email,
    Assinatura assinatura
) {
    
    public UsuarioListagem(Usuario usuario ) {
        this(usuario.getNome(), usuario.getEmail(), usuario.getAssinatura());
    }
}
