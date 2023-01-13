package com.provectus.kafka.ui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = LdapAutoConfiguration.class)
@EnableScheduling
@EnableAsync
public class KafkaUiApplication {

  public static void main(String[] args) {
    startApplication(args);
  }

  public static ConfigurableApplicationContext startApplication(String[] args) {
    return SpringApplication.run(KafkaUiApplication.class, args);
  }
}
