package com.usermanager.manager.model.sale;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import com.usermanager.manager.enums.Status;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity(name = "Sale")
@Table(name = "sale")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false)
    // UserAmout = 0 para ofertas que contem tempo de expiração
    private Integer userAmount = 0;

    @Column(nullable = true)
    private ZonedDateTime saleExpiration;

    @Column(nullable = false)
    private Integer userSubscriptionTime = 30;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @PrePersist
    public void prePersist() {
        if (userAmount == 0 && saleExpiration == null) {
            throw new IllegalArgumentException("Para ofertas ilimitadas de usuário, é necessário ter uma data de expiração.");
        }
    }
}
