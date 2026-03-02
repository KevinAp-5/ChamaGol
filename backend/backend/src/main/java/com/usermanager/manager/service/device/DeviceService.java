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

@Service
@Slf4j
@RequiredArgsConstructor
public class DeviceService {
    private final DeviceRepository deviceRepository;
    private final UserService userService;

    @Transactional
    public void registerDevice(@NotNull @Positive Long userId, @Valid RegisterDeviceRequest request) {

        User user = userService.findById(userId);

        Optional<Device> existingDevice = deviceRepository.findByPushToken(request.token());

        if (existingDevice.isPresent()) {
            Device device = existingDevice.get();
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
    }

    public List<Device> findAllByActiveTrue() {
        return deviceRepository.findAllByActiveTrue();
    }
}
