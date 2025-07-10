package com.usermanager.manager.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoEvento {
    DICA("DICA"),
    GOL("GOL"),
    CARTAO("CARTAO"),
    ALERTA("ALERTA"),
    VIP("VIP");

    private final String name;

    TipoEvento(String tipo) {
        this.name = tipo;
    }

    @JsonValue
    public String getName() {
        return this.name;
    }

    @JsonCreator
    public static TipoEvento fromString(String name) {
        for (TipoEvento tipo : values()) {
            if (tipo.name.equalsIgnoreCase(name)) {
                return tipo;
            }
        }
        return DICA; // Retorna valor padrão se não encontrar
    }

    @Override
    public String toString() {
        return this.name;
    }
}