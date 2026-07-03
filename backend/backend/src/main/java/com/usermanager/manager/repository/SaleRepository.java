package com.usermanager.manager.repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.usermanager.manager.enums.Status;
import com.usermanager.manager.model.sale.Sale;


public interface SaleRepository extends JpaRepository<Sale, Long>{

    Optional<Sale> findFirstByStatus(Status status);

    List<Sale> findAllByStatusAndSaleExpirationBefore(Status active, ZonedDateTime now);
}
