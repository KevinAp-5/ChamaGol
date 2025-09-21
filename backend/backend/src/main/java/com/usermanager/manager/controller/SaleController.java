package com.usermanager.manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.util.UriComponentsBuilder;

import com.usermanager.manager.dto.sale.CreateSale;
import com.usermanager.manager.mappers.SaleMapper;
import com.usermanager.manager.model.sale.Sale;
import com.usermanager.manager.service.sale.SaleService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/api/sale")
@Slf4j
public class SaleController {

    private SaleService saleService;
    private SaleMapper saleMapper;

    public SaleController(SaleService saleService, SaleMapper saleMapper) {
        this.saleService = saleService;
        this.saleMapper = saleMapper;
    }

    @PostMapping
    public ResponseEntity<Sale> createSale(@RequestBody @Valid CreateSale sale) {
        log.info("Create sale: {}", sale);
        Sale newSale = saleService.createSale(sale);
        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/sale")
                .path("/{id}")
                .buildAndExpand(newSale.getId())
                .toUri())
                .body(newSale);
    }
}
