package com.usermanager.manager.service.sale;

import java.util.List;
import java.util.Optional;

import com.usermanager.manager.dto.sale.CreateSale;
import com.usermanager.manager.model.sale.Sale;

public interface SaleService {

    Sale createSale(CreateSale sale);

    void deactivateSale();

    List<Sale> getAllSales();

    Optional<Sale> getActiveSale();

    Sale useSale();
}
