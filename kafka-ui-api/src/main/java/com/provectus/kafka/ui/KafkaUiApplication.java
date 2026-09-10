package com.provectus.kafka.ui;

import com.provectus.kafka.ui.util.DynamicConfigOperations;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(excludeName = "org.springframework.boot.ldap.autoconfigure.LdapAutoConfiguration")
@EnableScheduling
@EnableAsync
public class KafkaUiApplication {

  public static void main(String[] args) {
    startApplication(args);
  }

  public static ConfigurableApplicationContext startApplication(String[] args) {
    return new SpringApplicationBuilder(KafkaUiApplication.class)
        .initializers(DynamicConfigOperations.dynamicConfigPropertiesInitializer())
        .build()
        .run(args);
  }
}
