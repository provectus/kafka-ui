package com.provectus.kafka.ui;

import com.provectus.kafka.ui.util.DynamicConfigOperations;
import java.util.Map;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = LdapAutoConfiguration.class)
@EnableScheduling
@EnableAsync
public class KafkaUiApplication {

  public static void main(String[] args) {
    AdminClient ac = AdminClient.create(Map.of(
        AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092"
    ));
    System.out.println(ac);
  }

  public static ConfigurableApplicationContext startApplication(String[] args) {
    return new SpringApplicationBuilder(KafkaUiApplication.class)
        .initializers(DynamicConfigOperations.dynamicConfigPropertiesInitializer())
        .build()
        .run(args);
  }
}
