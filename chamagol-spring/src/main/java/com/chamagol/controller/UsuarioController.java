package com.chamagol.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.chamagol.dto.usuario.UsuarioDTO;
import com.chamagol.dto.usuario.UsuarioListagem;
import com.chamagol.dto.usuario.UsuarioResponseEntityBody;
import com.chamagol.dto.usuario.UsuarioUpdate;
import com.chamagol.service.UsuarioService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/user/registrar")
    @ResponseStatus(code = HttpStatus.CREATED)
    public ResponseEntity<UsuarioResponseEntityBody> create(
        @RequestBody @Valid @NotNull UsuarioDTO usuarioDTO,
        UriComponentsBuilder uriComponentsBuilder
        ) {
        return usuarioService.create(usuarioDTO, uriComponentsBuilder);
    }

    @GetMapping("/user/")
    public ResponseEntity<List<UsuarioListagem>> lista() {
        return usuarioService.listagemActive();
    }

    @GetMapping("/user/inativos")
    public ResponseEntity<List<UsuarioListagem>> listaInactive() {
        return usuarioService.listagemInactive();
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UsuarioResponseEntityBody> findById(
        @PathVariable("id") @NotNull @Positive Long id
        ) {
        return usuarioService.findById(id);
    }

    @PutMapping("/user/")
    public ResponseEntity<UsuarioResponseEntityBody> update(
        @RequestBody @Valid @NotNull UsuarioUpdate usuarioUpdate) {
        return usuarioService.update(usuarioUpdate);
    }

    @DeleteMapping("/user/{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteSoft(@PathVariable("id") @NotNull @Positive Long id) {
        return usuarioService.deleteSoft(id);
    }

    @DeleteMapping("/user/harddelete/{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete (@PathVariable("id") @NotNull @Positive Long id) {
        return usuarioService.delete(id);
    }
 
    @PutMapping("/user/ativar/{id}")
    public ResponseEntity<Void> activate(@PathVariable("id") @NotNull @Positive Long id) {
        return usuarioService.activate(id);
    }
}
