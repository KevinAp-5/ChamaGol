package com.usermanager.manager.model.term;

import java.time.ZonedDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.usermanager.manager.model.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_term_acceptance")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserTermAcceptance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "term_of_use_id")
    private TermOfUse termOfUse;

    @Column(name = "is_adult", nullable = false)
    private Boolean isAdult;

    @CreationTimestamp
    @Column(name = "accepted_at", nullable = false, updatable = false)
    private ZonedDateTime acceptedAt;

}
