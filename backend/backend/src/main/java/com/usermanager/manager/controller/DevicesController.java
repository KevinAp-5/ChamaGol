package com.usermanager.manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.usermanager.manager.dto.device.RegisterDeviceRequest;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.device.DeviceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/devices/")
@Slf4j
@RequiredArgsConstructor
public class DevicesController {

    private final DeviceService deviceService;

    @PostMapping("register")
    public ResponseEntity<Void> registerDevice(@AuthenticationPrincipal User user, @RequestBody RegisterDeviceRequest request) {
        deviceService.registerDevice(user.getId(), request);
        return ResponseEntity.ok().build();
    }
}
