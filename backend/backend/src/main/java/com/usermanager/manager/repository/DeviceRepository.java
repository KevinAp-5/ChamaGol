package com.usermanager.manager.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.usermanager.manager.model.device.Device;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID>{

    Optional<Device> findByPushToken(String pushToken);

    List<Device> findAllByUserIdAndActiveTrue(Long userId);

    List<Device> findAllByActiveTrue();

    List<Device> findAllByUserIdIn(List<Long> user);
}
