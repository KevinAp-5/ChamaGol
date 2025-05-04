package com.usermanager.manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.usermanager.manager.model.signal.Signal;

@Repository
public interface SignalsRepository extends JpaRepository<Signal, Long>{

}
