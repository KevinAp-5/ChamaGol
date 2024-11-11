package com.chamagol.enums.converters;

import java.util.stream.Stream;

import com.chamagol.enums.Roles;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RolesConverter implements AttributeConverter<Roles, String>{

    @Override
    public String convertToDatabaseColumn(Roles attribute) {
        if (attribute == null) {
            return null;
        }

        return attribute.getRole();
    }

    @Override
    public Roles convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        return Stream.of(Roles.values())
            .filter(roles -> roles.getRole().equals(dbData))
            .findFirst()
            .orElseThrow(IllegalArgumentException:: new);
    }

}
