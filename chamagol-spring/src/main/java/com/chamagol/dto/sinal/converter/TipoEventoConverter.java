package com.chamagol.dto.sinal.converter;

import com.chamagol.enums.TipoEvento;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TipoEventoConverter implements AttributeConverter<TipoEvento, String>{
    @Override
    public String convertToDatabaseColumn(TipoEvento attribute) {
        if (attribute == null) {
            throw new IllegalArgumentException("TipoEvento não pode ser nulo");
        }
        return attribute.getName();
    }

    @Override
    public TipoEvento convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            throw new IllegalArgumentException("Valor do banco de dados para TipoEvento não pode ser nulo");
        }
        return TipoEvento.fromString(dbData);
    }
}
