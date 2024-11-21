package com.chamagol;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@EnableAsync
@Slf4j
@EnableCaching
public class ChamagolApplication {
	public static void main(String[] args) {
		SpringApplication.run(ChamagolApplication.class, args);
		log.info("ChamaGol Started.");
	}

}
