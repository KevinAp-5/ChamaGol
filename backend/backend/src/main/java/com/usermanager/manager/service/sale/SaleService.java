package com.usermanager.manager.service.sale;

import java.util.List;

import com.usermanager.manager.dto.sale.CreateSale;
import com.usermanager.manager.model.sale.Sale;

public interface SaleService {

    Sale createSale(CreateSale sale);

    void deactivateSale();

    List<Sale> getAllSales();

    Sale getActiveSale();
}
