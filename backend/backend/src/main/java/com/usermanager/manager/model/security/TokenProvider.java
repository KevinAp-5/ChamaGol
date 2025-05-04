package com.usermanager.manager.model.security;

import com.usermanager.manager.model.user.User;

public interface TokenProvider {

    String generateToken(User user);
    String validateToken(String token);
    String getUsernameFromToken(String token);
    String generateToken(User user, long expirationMinutes);
}
