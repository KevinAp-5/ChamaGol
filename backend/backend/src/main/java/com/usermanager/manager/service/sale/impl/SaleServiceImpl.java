package com.usermanager.manager.service.sale.impl;

import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.dto.sale.CreateSale;
import com.usermanager.manager.enums.Status;
import com.usermanager.manager.exception.sale.ActiveSaleException;
import com.usermanager.manager.model.sale.Sale;
import com.usermanager.manager.repository.SaleRepository;
import com.usermanager.manager.service.sale.SaleService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SaleServiceImpl implements SaleService {

    private SaleRepository saleRepository;

    public SaleServiceImpl(SaleRepository saleRepository) {
        this.saleRepository = saleRepository;
    }

    @Override
    @Transactional
    public Sale createSale(CreateSale sale) {

        saleRepository.findFirstByStatus(Status.ACTIVE).ifPresent(value -> {throw new ActiveSaleException("");});

        Sale newSale = Sale.builder()
                .name(sale.name())
                .salePrice(sale.salePrice())
                .userAmount(sale.userAmount())
                .usedAmount(0)
                .saleExpiration(sale.saleExpiration())
                .creationDate(ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")))
                .finishedDate(null)
                .userSubscriptionTime(sale.userSubscriptionTime())
                .status(Status.ACTIVE)
                .build();
        return saleRepository.save(newSale);
    };

    @Override
    @Transactional
    public void deactivateSale() {
        saleRepository.findFirstByStatus(Status.ACTIVE)
        .ifPresent(sale -> saleRepository.save(sale.deactivate()));
    }

}
