package com.chamagol.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chamagol.dto.UsuarioDTO;

@RestController
@RequestMapping("/user")
public class UsuarioController {

    @PostMapping
    public void testeGet(@RequestBody UsuarioDTO usuario) {
        System.out.println(usuario);
    }
}
