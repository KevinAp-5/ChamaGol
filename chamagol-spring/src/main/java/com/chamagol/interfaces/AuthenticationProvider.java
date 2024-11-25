package com.chamagol.interfaces;

import org.springframework.security.core.userdetails.UserDetails;

public interface AuthenticationProvider {
    UserDetails loadUserByUsername(String username);
}
