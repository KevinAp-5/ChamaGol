package com.usermanager.manager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
@RequestMapping()
public class PageController {

    @GetMapping("/api/page")
    public String home() {
        return "home";
    }
    
}