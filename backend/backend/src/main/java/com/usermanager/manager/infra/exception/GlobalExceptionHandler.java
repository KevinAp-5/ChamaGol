package com.usermanager.manager.infra.exception;


import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.usermanager.manager.dto.common.ResponseMessage;
import com.usermanager.manager.exception.authentication.PasswordFormatNotValidException;
import com.usermanager.manager.exception.authentication.TokenInvalid;
import com.usermanager.manager.exception.authentication.TokenInvalidException;
import com.usermanager.manager.exception.authentication.TokenNotFoundException;
import com.usermanager.manager.exception.sale.ActiveSaleException;
import com.usermanager.manager.exception.term.TermExistsException;
import com.usermanager.manager.exception.term.TermNotFoundException;
import com.usermanager.manager.exception.user.UserExistsException;
import com.usermanager.manager.exception.user.UserNotEnabledException;
import com.usermanager.manager.exception.user.UserNotFoundException;

import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(UserExistsException.class)
    public ResponseEntity<ResponseMessage> handleUserExistsException(UserExistsException ex) {
        return ResponseEntity.status(409).body(new ResponseMessage("Usuário já existe: " + ex.getMessage()));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ResponseMessage> handleUserDoesNotExistsException(UserNotFoundException ex) {
        return ResponseEntity.status(404).body(new ResponseMessage("Usuário não encontrado com login: " + ex.getMessage()));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ResponseMessage> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        return ResponseEntity.status(404).body(new ResponseMessage("Nome de usuário não encontrado: " + ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ResponseMessage> handleBadCredentialsException(BadCredentialsException ex) {
        return ResponseEntity.status(401).body(new ResponseMessage("Credenciais inválidas: " + ex.getMessage()));
    }

    @ExceptionHandler(UserNotEnabledException.class)
    public ResponseEntity<ResponseMessage> handleUserNotEnabledException(UserNotEnabledException ex) {
        return ResponseEntity.status(401).body(new ResponseMessage("Por favor, ative a conta. " + ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseMessage> handleException(Exception ex) {
        log.error("", ex);
        return ResponseEntity.status(500).body(new ResponseMessage("Erro interno no servidor: " + ex.getMessage()));
    }

    @ExceptionHandler(TokenNotFoundException.class)
    public ResponseEntity<ResponseMessage> handleTokenNotFoundException(TokenNotFoundException ex) {
        return ResponseEntity.status(404).body(new ResponseMessage("Erro de token: " + ex.getMessage()));
    }

    @ExceptionHandler(TokenInvalidException.class)
    public ResponseEntity<ResponseMessage> handleTokenInvalidException(TokenInvalidException ex) {
        return ResponseEntity.status(401).body(new ResponseMessage("Token expirado ou inválido: " + ex.getMessage()));
    }

    @ExceptionHandler(TokenInvalid.class)
    public ResponseEntity<ResponseMessage> handleTokenInvalid(TokenInvalid ex) {
        return ResponseEntity.status(401).body(new ResponseMessage("Token expirado ou inválido: " + ex.getMessage()));
    }

    @ExceptionHandler(PasswordFormatNotValidException.class)
    public ResponseEntity<ResponseMessage> handlePasswordFormatNotValid(PasswordFormatNotValidException ex) {
        return ResponseEntity.status(400).body(new ResponseMessage("Formato de senha inválido: " + ex.getMessage()));
    }

    @ExceptionHandler(TermExistsException.class)
    public ResponseEntity<ResponseMessage> handleTermExistsException(TermExistsException ex) {
        return ResponseEntity.status(409).body(new ResponseMessage("Termo já existe: " + ex.getMessage()));
    }

    @ExceptionHandler(TermNotFoundException.class)
    public ResponseEntity<ResponseMessage> handleTermNotFoundException(TermNotFoundException ex) {
        return ResponseEntity.status(404).body(new ResponseMessage("Nenhum termo encontrado: " + ex.getMessage()));
    }

    @ExceptionHandler(ActiveSaleException.class)
    public ResponseEntity<ResponseMessage> handleActiveSaleException(ActiveSaleException ex) {
        return ResponseEntity.status(409).body(new ResponseMessage("Não é possível criar uma oferta nova. Desative a oferta ativa antes."));
    }
}
