package com.chamagol;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ChamagolApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChamagolApplication.class, args);
	}

}
