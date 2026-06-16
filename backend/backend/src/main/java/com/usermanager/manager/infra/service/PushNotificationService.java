package com.usermanager.manager.infra.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.usermanager.manager.model.device.Device;
import com.usermanager.manager.service.device.DeviceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class PushNotificationService {
    private final DeviceService deviceService;

    private final RestClient restClient =
        RestClient.builder()
            .baseUrl("https://exp.host/--/api/v2/push/send")
            .defaultHeader("Content-Type", "application/json")
            .build();

    public void sendToUsers(List<Long> usersIds, String title, String body) {
        log.info("Users received to send notification: {}, notification body: {}", usersIds, body);
        List<Device> devices = deviceService.findAllByUserIdIn(usersIds);

        log.info("Devices found to send notification: {}", devices.size());
        
        for (Device device : devices) {
            String devicePushToken = device.getPushToken();
            if (devicePushToken == null || devicePushToken.isEmpty()) {
                log.warn("Push token nulo ou vazio para device ID: {}", device.getId());
                continue;
            }
            
            log.info("Sending push to token: {}", devicePushToken);
            send(devicePushToken, title, body);
        }
    }

    public void sendToAll(String title, String body) {
        List<Device> devices = deviceService.findAllByActiveTrue();
        log.info("Sending to all active devices: {}", devices.size());
        
        devices.forEach(device -> 
            send(device.getPushToken(), title, body)
        );
    }

    private void send(String token, String title, String body) {
        Map<String, Object> payload = Map.of(
            "to", token,
            "title", title,
            "body", body,
            "sound", "default",
            "data", Map.of(
                "screen", "Timeline"
            )
        );

        try {
            var response = restClient.post()
                .body(payload)
                .retrieve()
                .body(String.class);
            
            log.info("Expo notification sent successfully: {}", response);
        } catch (Exception e) {
            log.error("Erro ao enviar push para token {}: {}", token, e.getMessage(), e);
        }
    }
}