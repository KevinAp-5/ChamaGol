package com.usermanager.manager.model.message;

import java.time.ZonedDateTime;

import com.usermanager.manager.enums.People;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "message")
@Entity(name = "Message")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    
    @Builder.Default()
    @Column(nullable = false)
    private ZonedDateTime created_at = ZonedDateTime.now();

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private People people;
}
