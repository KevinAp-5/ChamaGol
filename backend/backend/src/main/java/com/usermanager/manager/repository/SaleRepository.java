package com.usermanager.manager.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.usermanager.manager.enums.Status;
import com.usermanager.manager.model.sale.Sale;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long>{

    Optional<Sale> findFirstByStatus(Status status);
}
