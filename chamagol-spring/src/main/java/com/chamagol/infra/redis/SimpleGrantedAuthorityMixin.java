package com.chamagol.infra.redis;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

abstract class SimpleGrantedAuthorityMixin {
    @JsonCreator
    SimpleGrantedAuthorityMixin(@JsonProperty("authority") String authority) {
    }
}