package com.chamagol.infra.redis;

import org.redisson.Redisson;
import org.redisson.api.RTopic;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.redisson.spring.cache.RedissonSpringCacheManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class RedisConfig {
    @Value("${redis.connection.url}")
    private String redisConnection;
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
              .setAddress(redisConnection) // Ajuste conforme sua configuração
              .setConnectionPoolSize(10)
              .setConnectionMinimumIdleSize(2);
        return Redisson.create(config);
    }

    @Bean
    public CacheManager cacheManager(RedissonClient redissonClient) {
        return new RedissonSpringCacheManager(redissonClient);
    }

    @Bean
    public RTopic sinalChangeTopic(RedissonClient redissonClient) {
        return redissonClient.getTopic("sinal-change");
    }
}
