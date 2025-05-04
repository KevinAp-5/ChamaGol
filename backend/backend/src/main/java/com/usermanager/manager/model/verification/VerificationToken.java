package com.usermanager.manager.model.verification;

import java.time.Instant;
import java.util.UUID;

import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.verification.enums.TokenType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity(name = "VerificationToken")
@Table(name = "verification_token")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Builder
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(columnDefinition = "UUID", nullable = false)
    private UUID uuid;
    
    private Instant creationDate;

    private Instant activationDate;

    private Instant expirationDate;

    @Enumerated(EnumType.STRING)
    private TokenType tokenType;

    @Builder.Default
    private boolean activated = false;

}
