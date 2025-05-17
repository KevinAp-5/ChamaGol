package com.usermanager.manager.dto.user;

import java.time.ZonedDateTime;

public record UserLoginInfo(String username, ZonedDateTime lastLogin) {

}
