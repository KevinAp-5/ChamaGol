package com.usermanager.manager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping()
public class PageController {

    @GetMapping("/")
    public String home() {
        return "home";
    }
    
}
