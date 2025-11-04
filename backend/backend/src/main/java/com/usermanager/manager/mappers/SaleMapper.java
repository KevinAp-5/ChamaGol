package com.usermanager.manager.mappers;

import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.usermanager.manager.dto.sale.CreateSale;
import com.usermanager.manager.model.sale.Sale;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SaleMapper {
    Sale CreateSaleToSale(CreateSale createSale);
    CreateSale SaleToCreateSale(Sale sale);

    default ZonedDateTime map(Integer days) {
        if (days == null) return null;
        return ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")).plusDays(days);
    }

    default Integer map(ZonedDateTime dateTime) {
        if (dateTime == null) return null;
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("America/Sao_Paulo"));
        return (int) java.time.Duration.between(now, dateTime).toDays();
    }
}
