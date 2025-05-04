package com.usermanager.manager.dto.user;

import java.time.ZonedDateTime;

public record ProfileDTO(String name, String email, ZonedDateTime createdAt) {

}
