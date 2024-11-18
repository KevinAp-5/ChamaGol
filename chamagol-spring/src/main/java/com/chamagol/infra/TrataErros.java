package com.chamagol.infra;

import java.nio.file.AccessDeniedException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import com.chamagol.exception.IDNotFoundException;
import com.chamagol.exception.TokenInvalid;

import jakarta.persistence.EntityNotFoundException;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TrataErros {

    // Tratamento para erros de validação (400 Bad Request)
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(HandlerMethodValidationException ex) {
        Map<String, String> erros = new HashMap<>();

        ex.getAllErrors().forEach(error -> {
            if (error instanceof FieldError) {
                String fieldName = ((FieldError) error).getField();
                String errorMessage = error.getDefaultMessage();
                erros.put(fieldName, errorMessage);
            }
            else {
                erros.put("Error: ", error.getDefaultMessage());
            }
        });

        return new ResponseEntity<>(erros, HttpStatus.BAD_REQUEST);
    }

    // Tratamento para erro de argumento inválido (400 Bad Request)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        @SuppressWarnings("null")
        String requiredType = ex.getRequiredType().getSimpleName();
        if (requiredType == null) {
            return new ResponseEntity<>(
                String.format("Valor '%s' inválido para o campo '%s'", ex.getValue(), ex.getName()
                ), HttpStatus.BAD_REQUEST);
        }

        String errorMessage = String.format("O valor '%s' não é válido para o campo '%s'. Esperado: '%s'.",
                ex.getValue(), ex.getName(), requiredType);
        return new ResponseEntity<>(errorMessage, HttpStatus.BAD_REQUEST);
    }

    // Tratamento para parâmetros faltantes (400 Bad Request)
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<String> handleMissingParams(MissingServletRequestParameterException ex) {
        String errorMessage = String.format("O parâmetro '%s' é obrigatório.", ex.getParameterName());
        return new ResponseEntity<>(errorMessage, HttpStatus.BAD_REQUEST);
    }

    // Tratamento para recurso não encontrado (404 Not Found)
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleEntityNotFound(EntityNotFoundException ex) {
        return new ResponseEntity<>("Recurso não encontrado: " + ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    // Tratamento para exceções do tipo ResponseStatusException (flexível para vários status)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return new ResponseEntity<>(ex.getReason(), ex.getStatusCode());
    }

    // Tratamento para erro de acesso negado (403 Forbidden)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>("Acesso negado: " + ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    // Tratamento para erro de autenticação (401 Unauthorized)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<String> handleUnauthorized(AuthenticationException ex) {
        return new ResponseEntity<>("Problema de autenticação: " + ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(TokenInvalid.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<String> handleTokenInvalidException(TokenInvalid ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Erro de validação: " + ex.getMessage()); // Retorna a mensagem "Token inválido ou expirado"
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado: " + ex.getMessage());
    }

    @ExceptionHandler(IDNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleIDNotFoundException(IDNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ID não encontrado: " + ex.getMessage());
    }
    // Tratamento para erros internos do servidor (500 Internal Server Error)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralExceptions(Exception ex) {
        return new ResponseEntity<>("Dados inválidos: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}