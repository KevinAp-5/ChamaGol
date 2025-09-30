package com.usermanager.manager.service.sale.impl;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

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

        saleRepository.findFirstByStatus(Status.ACTIVE).ifPresent(value -> {
            throw new ActiveSaleException("");
        });

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

    @Override
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    @Override
    public Optional<Sale> getActiveSale() {
        return saleRepository.findFirstByStatus(Status.ACTIVE);
    }

    @Override
    @Transactional
    public Sale useSale() {
        Sale activeSale = saleRepository.findFirstByStatus(Status.ACTIVE).orElse(null);

        Integer usedAmount = activeSale.getUsedAmount();

        activeSale.setUsedAmount(usedAmount++);
        if (activeSale.getUsedAmount() >= activeSale.getUserAmount()) {
            activeSale.setStatus(Status.INACTIVE);
            activeSale.setFinishedDate(ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")));
            activeSale.setSaleExpiration(ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")));
        }

        return saleRepository.save(activeSale);
    }
}
