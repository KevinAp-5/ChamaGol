package com.usermanager.manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.usermanager.manager.model.VipActivation.VipActivation;

public interface VipActivationRepository extends JpaRepository<VipActivation, Long> {

    VipActivation findFirstByProcessedFalseOrderByCreationDateAsc();
}
