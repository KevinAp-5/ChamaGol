package com.chamagol.infra;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import jakarta.persistence.EntityNotFoundException;

@RestControllerAdvice
public class TrataErros {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Object> trata404() {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<Map<String, String>> trata400(HandlerMethodValidationException ex) {
        Map<String, String> errors = new HashMap<>();

        // Itera sobre todos os erros de validação
        ex.getAllErrors().forEach(error -> {
            if (error instanceof FieldError) {
                String fieldName = ((FieldError) error).getField();
                String errorMessage = error.getDefaultMessage();
                errors.put(fieldName, errorMessage);
            } else {
                errors.put("Error: ", error.getDefaultMessage());
            }
        });

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
