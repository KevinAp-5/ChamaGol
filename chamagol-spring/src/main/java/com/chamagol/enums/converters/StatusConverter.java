package com.chamagol.enums.converters;

import java.util.stream.Stream;

import com.chamagol.enums.Status;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusConverter implements AttributeConverter<Status, String>{

    @Override
    public String convertToDatabaseColumn(Status value) {
        if (value == null) {
            return null;
        }

        return value.getValue();
    }

    @Override
    public Status convertToEntityAttribute(String value) {
        if (value == null) {
            return null;
        }

        return Stream.of(Status.values())
            .filter(status -> status.getValue().equals(value))
            .findFirst()
            .orElseThrow(IllegalArgumentException:: new);
    }
}
