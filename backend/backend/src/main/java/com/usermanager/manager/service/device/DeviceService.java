package com.usermanager.manager.service.device;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.google.firebase.database.annotations.NotNull;
import com.usermanager.manager.dto.device.RegisterDeviceRequest;
import com.usermanager.manager.enums.Platform;
import com.usermanager.manager.model.device.Device;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.repository.DeviceRepository;
import com.usermanager.manager.service.user.UserService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;

@Service
@Slf4j
@Validated
@RequiredArgsConstructor
public class DeviceService {
    private final DeviceRepository deviceRepository;
    private final UserService userService;

    @Transactional
    public void registerDevice(@NotNull @Positive Long userId, @Valid RegisterDeviceRequest request) {
        log.info("Registrando device para userId={} | token={} | plataforma={}", userId, request.token(), request.platform());

        User user = userService.findById(userId);

        Optional<Device> existingDevice = deviceRepository.findByPushToken(request.token());

        if (existingDevice.isPresent()) {
            Device device = existingDevice.get();
            log.info("Device já existe para token={}, atualizando usuário e data de uso", request.token());
            device.setUser(user);
            device.setActive(true);
            device.setLastUsedAt(LocalDateTime.now());
            return;
        }

        Device device = new Device();
        device.setPushToken(request.token());
        device.setPlatform(Platform.valueOf(request.platform().toUpperCase()));
        device.setUser(user);
        device.setActive(true);

        deviceRepository.save(device);
        log.info("Novo device registrado para userId={} | token={}", userId, request.token());
    }

    public List<Device> findAllByActiveTrue() {
        log.debug("Buscando todos os devices ativos");
        return deviceRepository.findAllByActiveTrue();
    }

    public List<Device> findAllByUserIdIn(List<Long> usersIds) {
        log.debug("Buscando devices para os usuários: {}", usersIds);
        return deviceRepository.findAllByUserIdIn(usersIds);
    }
}
