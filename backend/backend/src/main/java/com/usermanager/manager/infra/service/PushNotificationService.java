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
            .baseUrl("https://exp.host")
            .build();


    public void sendToUsers(List<Long> usersIds, String title, String body) {
        log.info("users received do send notification: {}, notification body: {}", usersIds, body);
        List<Device> devices = deviceService.findAllByUserIdIn(usersIds);

        log.info("devices found to send notification: {}", devices.toString());
        for (Device device: devices) {
            String devicePushToken = device.getPushToken();
            log.info("device push Token: {}", devicePushToken);
            Map<String, Object> payload = Map.of(
                "to", devicePushToken,
                "title", title,
                "body", body,
                "sound", "default"
            );

            try {
                var response = restClient.post()
                    .uri("/--/api/v2/push/send")
                    .body(List.of(payload))
                    .retrieve()
                    .toBodilessEntity();
                log.info("Expo notification send response: {}", response);
            } catch (Exception e) {
                log.info("Erro ao enviar push: {}", e.getMessage());
            }
        }
    }

    public void sentToAll(String title, String body) {
        List<Device> devices = deviceService.findAllByActiveTrue();

        devices.forEach(device -> send(device.getPushToken(), title, body));
    }

    private void send(String token, String title, String body) {
        Map<String, Object> payload = Map.of(
                "to", token,
                "title", title,
                "body", body,
                "sound", "default");

        restClient.post()
                .uri("/--/api/v2/push/send")
                .body(payload)
                .retrieve()
                .toBodilessEntity();
    }
}
