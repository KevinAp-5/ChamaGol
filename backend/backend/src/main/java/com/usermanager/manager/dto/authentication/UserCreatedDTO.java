package com.usermanager.manager.dto.authentication;

public record UserCreatedDTO(
    Long id,
    String name,
    String login,
    Boolean emailVerified

) {

}
