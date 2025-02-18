package com.chamagol.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/runningMessage")
@Slf4j
public class ApiController {

    @GetMapping
    public ResponseMessage runningMessage() {
        log.info("running message hit");
        return new ResponseMessage("API está rodando");
    }

    private record ResponseMessage(String message) {
    }
}

