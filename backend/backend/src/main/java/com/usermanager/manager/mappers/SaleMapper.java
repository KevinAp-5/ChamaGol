package com.usermanager.manager.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.usermanager.manager.dto.sale.CreateSale;
import com.usermanager.manager.model.sale.Sale;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SaleMapper {
    Sale CreateSaleToSale(CreateSale createSale);
    CreateSale SaleToCreateSale(Sale sale);
}
