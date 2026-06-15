package com.internNova.InternNova;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InternNovaApplication {

	public static void main(String[] args) {
		SpringApplication.run(InternNovaApplication.class, args);
	}

}
