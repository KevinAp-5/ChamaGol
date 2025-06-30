package com.usermanager.manager.model.subscription;

import java.time.ZonedDateTime;

import com.usermanager.manager.model.user.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Table(name = "subscription_control")
@Entity(name = "SubscriptionControl")
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class SubscriptionControl {

    public SubscriptionControl(@NotNull User user) {
        this.userId = user;
        this.expirationAlert = false;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, cascade = CascadeType.REMOVE, fetch = 
    FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User userId;

    private boolean expirationAlert = false;

    @Column(updatable = false)
    private ZonedDateTime purchaseDate;

    @Column(updatable = false)
    private ZonedDateTime expirationDate;

    @PrePersist
    public void prePersist() {
        this.purchaseDate = ZonedDateTime.now();
        this.expirationDate = ZonedDateTime.now().plusMonths(1);
    }
}
