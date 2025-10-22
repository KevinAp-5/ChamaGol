package com.usermanager.manager.service.sale;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import com.usermanager.manager.dto.sale.CreateSale;
import com.usermanager.manager.enums.Status;
import com.usermanager.manager.exception.sale.ActiveSaleException;
import com.usermanager.manager.model.sale.Sale;
import com.usermanager.manager.repository.SaleRepository;
import com.usermanager.manager.service.sale.impl.SaleServiceImpl;

@ExtendWith(MockitoExtension.class)
class SaleServiceImplTest {

    @Mock
    private SaleRepository saleRepository;

    @InjectMocks
    private SaleServiceImpl saleService;

    @BeforeEach
    void setUp() {
        // MockitoExtension handles mocks
    }

    @Test
    void createSale_ShouldCreateNewSale_WhenNoActiveSaleExists() {
        CreateSale dto = new CreateSale(
            "Oferta Teste",
            new BigDecimal("99.90"),
            10,
            ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")),
            30,
            false
        );

        when(saleRepository.findFirstByStatus(Status.ACTIVE)).thenReturn(Optional.empty());

        // capture the sale passed to save
        ArgumentCaptor<Sale> captor = ArgumentCaptor.forClass(Sale.class);
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Sale result = saleService.createSale(dto);

        verify(saleRepository).save(captor.capture());
        Sale saved = captor.getValue();

        assertNotNull(saved);
        assertEquals("Oferta Teste", saved.getName());
        assertEquals(dto.salePrice(), saved.getSalePrice());
        assertEquals(dto.userAmount(), saved.getUserAmount());
        assertEquals(dto.userSubscriptionTime(), saved.getUserSubscriptionTime());
        assertEquals(Status.ACTIVE, saved.getStatus());

        // result should be the saved object returned by repository (service may return it)
        assertNotNull(result);
        assertEquals(saved, result);
    }

    @Test
    void createSale_ShouldThrowException_WhenActiveSaleExists() {
        CreateSale dto = new CreateSale(
            "Oferta Teste",
            new BigDecimal("99.90"),
            10,
            ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")),
            30,
            false
        );

        Sale activeSale = new Sale();
        activeSale.setStatus(Status.ACTIVE);
        when(saleRepository.findFirstByStatus(Status.ACTIVE)).thenReturn(Optional.of(activeSale));

        assertThrows(ActiveSaleException.class, () -> saleService.createSale(dto));
        verify(saleRepository, never()).save(any());
    }

    @Test
    void deactivateSale_ShouldSetSaleInactive_WhenActiveSaleExists() {
        Sale activeSale = new Sale();
        activeSale.setStatus(Status.ACTIVE);
        activeSale.setId(1L);

        when(saleRepository.findFirstByStatus(Status.ACTIVE)).thenReturn(Optional.of(activeSale));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Sale> opt = saleService.deactivateSale();
        assertTrue(opt.isPresent());
        Sale updated = opt.get();
        assertEquals(Status.INACTIVE, updated.getStatus());
        assertNotNull(updated.getFinishedDate());
        verify(saleRepository).save(updated);
    }

    @Test
    void getAllSales_ShouldReturnListOfSales() {
        Sale sale1 = new Sale();
        sale1.setName("Sale1");
        Sale sale2 = new Sale();
        sale2.setName("Sale2");
        when(saleRepository.findAll()).thenReturn(List.of(sale1, sale2));

        List<Sale> sales = saleService.getAllSales();

        assertEquals(2, sales.size());
        assertEquals("Sale1", sales.get(0).getName());
        assertEquals("Sale2", sales.get(1).getName());
    }

    @Test
    void getActiveSale_ShouldReturnActiveSale() {
        Sale activeSale = new Sale();
        activeSale.setStatus(Status.ACTIVE);
        when(saleRepository.findFirstByStatus(Status.ACTIVE)).thenReturn(Optional.of(activeSale));

        Optional<Sale> result = saleService.getActiveSale();

        assertTrue(result.isPresent());
        assertEquals(Status.ACTIVE, result.get().getStatus());
    }

    @Test
    void useSale_ShouldIncrementUsedAmount_AndDeactivateIfLimitReached() {
        Sale activeSale = new Sale();
        activeSale.setId(1L);
        activeSale.setName("Oferta Teste");
        activeSale.setSalePrice(new BigDecimal("99.90"));
        activeSale.setUserAmount(2);
        activeSale.setUsedAmount(1);
        activeSale.setSaleExpiration(ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")).plusDays(1));
        activeSale.setCreationDate(ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")));
        activeSale.setFinishedDate(null);
        activeSale.setUserSubscriptionTime(30);
        activeSale.setStatus(Status.ACTIVE);

        when(saleRepository.findFirstByStatus(Status.ACTIVE)).thenReturn(Optional.of(activeSale));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Sale result = saleService.useSale();

        assertNotNull(result);
        assertEquals(2, result.getUsedAmount());
        assertEquals(Status.INACTIVE, result.getStatus());
        assertNotNull(result.getFinishedDate());
        // saleExpiration should remain present (depends on impl)
        assertNotNull(result.getSaleExpiration());
        verify(saleRepository).save(result);
    }
}