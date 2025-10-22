package com.usermanager.manager.service.sale.impl;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.scheduling.annotation.Scheduled;
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

    private final SaleRepository saleRepository;

    public SaleServiceImpl(SaleRepository saleRepository) {
        this.saleRepository = saleRepository;
    }

    @Override
    @Transactional
    public Sale createSale(CreateSale sale) {
        saleRepository.findFirstByStatus(Status.ACTIVE).ifPresent(value -> {
            throw new ActiveSaleException("Já existe uma sale ativa");
        });

        if (Boolean.TRUE.equals(sale.userUnlimited()) && sale.saleExpiration() == null) {
            throw new IllegalArgumentException("Sale ilimitada por usuários precisa de data de expiração");
        }
        if (sale.saleExpiration() == null && (sale.userAmount() == null || sale.userAmount() <= 0)) {
            throw new IllegalArgumentException("Sem data de expiração é necessário userAmount > 0");
        }

        Sale newSale = Sale.builder()
                .name(sale.name())
                .salePrice(sale.salePrice())
                .userAmount(sale.userAmount())
                .usedAmount(0)
                .saleExpiration(sale.saleExpiration())
                .creationDate(ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")))
                .finishedDate(null)
                .userSubscriptionTime(sale.userSubscriptionTime())
                .userUnlimited(sale.userUnlimited())
                .status(Status.ACTIVE)
                .build();
        return saleRepository.save(newSale);
    }

    @Override
    @Transactional
    public Optional<Sale> deactivateSale() {
        Optional<Sale> sale = saleRepository.findFirstByStatus(Status.ACTIVE);
        if (sale.isPresent()) {
            Sale s = sale.get();
            s.setStatus(Status.INACTIVE);
            s.setFinishedDate(ZonedDateTime.now());
            saleRepository.save(s);
            return Optional.of(s);
        }
        return Optional.empty();
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkAndDeactivateExpiredSales() {
        ZonedDateTime now = ZonedDateTime.now();
        List<Sale> expired = saleRepository.findAllByStatusAndSaleExpirationBefore(Status.ACTIVE, now);
        for (Sale s : expired) {
            s.setStatus(Status.INACTIVE);
            s.setFinishedDate(now);
            saleRepository.save(s);
            log.info("Sale {} desativada por expiração.", s.getId());
        }
        log.debug("Sale checkAndDeactivate service ran, processed={}", expired.size());
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
        Sale activeSale = saleRepository.findFirstByStatus(Status.ACTIVE)
                .orElseThrow(() -> new IllegalStateException("No active sale"));

        int newUsed = (activeSale.getUsedAmount() == null ? 0 : activeSale.getUsedAmount()) + 1;
        activeSale.setUsedAmount(newUsed);

        if (activeSale.getUserAmount() != null && newUsed >= activeSale.getUserAmount()) {
            activeSale.setStatus(Status.INACTIVE);
            activeSale.setFinishedDate(ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")));
        }

        return saleRepository.save(activeSale);
    }
}
