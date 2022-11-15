package com.provectus.kafka.ui;

import lombok.SneakyThrows;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = LdapAutoConfiguration.class)
@EnableScheduling
@EnableAsync
public class KafkaUiApplication {

  @SneakyThrows
  public static void main(String[] args) {
    var snClass = Class.forName("org.xerial.snappy.Snappy");
    var f = snClass.getDeclaredField("impl");
    f.setAccessible(true);
    System.out.println("\n\n Snappy implementation (with gcompat): "
        + f.get(null)
        + "\n\n "
        + "\n\n ");

    SpringApplication.run(KafkaUiApplication.class, args);
  }
}
