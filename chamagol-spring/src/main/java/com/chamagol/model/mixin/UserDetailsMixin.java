package com.chamagol.model.mixin;

import com.fasterxml.jackson.annotation.JsonIgnore;

public abstract class UserDetailsMixin {
    @JsonIgnore
    abstract boolean isAccountNonExpired();

    @JsonIgnore
    abstract boolean isAccountNonLocked();

    @JsonIgnore
    abstract boolean isCredentialsNonExpired();
}
