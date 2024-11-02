// UsuarioController.java
package com.chamagol.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.usuario.UsuarioResponseEntityBody;
import com.chamagol.dto.usuario.UsuarioUpdate;
import com.chamagol.dto.util.ApiResponse;
import com.chamagol.service.UsuarioService;

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

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public ResponseEntity<ApiResponse> create(
        @RequestBody @Valid @NotNull UsuarioDTO usuarioDTO,
        UriComponentsBuilder uriComponentsBuilder
        ) {
        return usuarioService.create(usuarioDTO, uriComponentsBuilder);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioListagem>> listActiveUsers() {
        return usuarioService.listActive();
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<UsuarioListagem>> listInactiveUsers() {
        return usuarioService.listInactive();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseEntityBody> getUserById(
        @PathVariable("id") @NotNull @Positive Long id
    ) {
        return usuarioService.findById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseEntityBody> updateUser(
        @PathVariable("id") @NotNull @Positive Long id,
        @RequestBody @Valid @NotNull UsuarioUpdate usuarioUpdate
    ) {
        return usuarioService.update(id, usuarioUpdate);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> softDeleteUser(
        @PathVariable("id") @NotNull @Positive Long id
    ) {
        return usuarioService.deleteSoft(id);
    }

    @DeleteMapping("/{id}/hard")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> hardDeleteUser(
        @PathVariable("id") @NotNull @Positive Long id
    ) {
        return usuarioService.delete(id);
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(
        @PathVariable("id") @NotNull @Positive Long id
    ) {
        return usuarioService.activate(id);
    }
}
