// UsuarioController.java
package com.chamagol.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.usuario.UsuarioResponseEntityBody;
import com.chamagol.dto.usuario.UsuarioUpdate;
import com.chamagol.service.user.UsuarioService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/users")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<Page<UsuarioListagem>> listActiveUsers(Pageable pageable) {
        return ResponseEntity.ok(usuarioService.listActive(pageable));
    }

    @GetMapping("/inactive")
    public ResponseEntity<Page<UsuarioListagem>> listInactiveUsers(Pageable pageable) {
        return ResponseEntity.ok(usuarioService.listInactive(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseEntityBody> getUserById(
            @PathVariable("id") @NotNull @Positive Long id) {
        return ResponseEntity.ok(usuarioService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseEntityBody> updateUser(
            @PathVariable("id") @NotNull @Positive Long id,
            @RequestBody @Valid @NotNull UsuarioUpdate usuarioUpdate) {
        return ResponseEntity.ok(usuarioService.update(id, usuarioUpdate));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> softDeleteUser(
            @PathVariable("id") @NotNull @Positive Long id) {
        usuarioService.deleteSoft(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/hard")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> hardDeleteUser(
            @PathVariable("id") @NotNull @Positive Long id) {
        usuarioService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(
            @PathVariable("id") @NotNull @Positive Long id) {
        usuarioService.activate(id);
        return ResponseEntity.noContent().build();
    }

}
