package com.chamagol.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.UsuarioDTO;
import com.chamagol.model.Usuario;
import com.chamagol.repository.ChamaRepository;

@RestController
@RequestMapping("/user")
public class UsuarioController {

    @Autowired
    private ChamaRepository chamaRepository;

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public void testeGet(@RequestBody UsuarioDTO dadosUsuario) {
        chamaRepository.save(new Usuario(dadosUsuario));
    }

}
