package com.usermanager.manager.model.VipActivation;

import java.time.ZoneId;
import java.time.ZonedDateTime;

import com.usermanager.manager.model.sale.Sale;
import com.usermanager.manager.model.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity(name = "VipActivation")
@Table(name = "vip_activation")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VipActivation {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User userId;

    @ManyToOne()
    @JoinColumn(name = "sale_id", nullable = true)
    private Sale saleId;

    @Column(name = "creation_date", nullable = false)
    @Builder.Default
    private ZonedDateTime creationDate = ZonedDateTime.now(ZoneId.of("America/Sao_Paulo"));

    @Column(name = "processed", nullable = false)
    @Builder.Default
    private Boolean processed = false;

}
