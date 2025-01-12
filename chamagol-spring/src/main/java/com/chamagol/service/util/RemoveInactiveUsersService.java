package com.chamagol.service.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.chamagol.service.user.UsuarioService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RemoveInactiveUsersService {

    private final UsuarioService usuarioService;

    public RemoveInactiveUsersService(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Scheduled(cron = "@midnight")
    public boolean removeUsers() {
        Pageable pageable = PageRequest.of(0, 1000);
        Instant time = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"))
                                    .minusDays(1)
                                    .toInstant(ZoneOffset.UTC);

        List<Long> usersIdList = usuarioService.findInactiveUsersFrom(time, pageable).toList();

        if (usersIdList.isEmpty()) {
            log.info("No inactive users to be deleted. Skipping deletes.");
            return false;
        }

        log.info("Inactive users to be deleted: {}", usersIdList);

        int batchSize = 100;
        for (int i = 0; i < usersIdList.size(); i += batchSize) {
            List<Long> batch = usersIdList.subList(i, Math.min(i + batchSize, usersIdList.size()));
            usuarioService.deleteMultipleInativeUsersById(batch);
            log.info("Deleted batch: {}", batch);
        }

        log.info("Inactive users deleted successfully.");
        return true;
    }

}
