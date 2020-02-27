package com.provectus.kafka.ui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class KafkaMetricsApplication {

	public static void main(String[] args) {
		SpringApplication.run(KafkaMetricsApplication.class, args);
	}

}
