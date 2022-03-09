package com.provectus.kafka.ui;

import com.provectus.kafka.ui.container.KafkaConnectContainer;
import com.provectus.kafka.ui.container.SchemaRegistryContainer;
import java.util.List;
import java.util.Properties;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.function.ThrowingConsumer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.utility.DockerImageName;


@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureWebTestClient(timeout = "60000")
@ContextConfiguration(initializers = {AbstractIntegrationTest.Initializer.class})
public abstract class AbstractIntegrationTest {
  public static final String LOCAL = "local";
  public static final String SECOND_LOCAL = "secondLocal";

  private static final String CONFLUENT_PLATFORM_VERSION = "5.5.0";

  public static final KafkaContainer kafka = new KafkaContainer(
      DockerImageName.parse("confluentinc/cp-kafka").withTag(CONFLUENT_PLATFORM_VERSION))
      .withNetwork(Network.SHARED);

  public static final SchemaRegistryContainer schemaRegistry =
      new SchemaRegistryContainer(CONFLUENT_PLATFORM_VERSION)
          .withKafka(kafka)
          .dependsOn(kafka);

  public static final KafkaConnectContainer kafkaConnect =
      new KafkaConnectContainer(CONFLUENT_PLATFORM_VERSION)
          .withKafka(kafka)
          .dependsOn(kafka)
          .dependsOn(schemaRegistry);

  static {
    kafka.start();
    schemaRegistry.start();
    kafkaConnect.start();
  }

  public static class Initializer
      implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(@NotNull ConfigurableApplicationContext context) {
      System.setProperty("kafka.clusters.0.name", LOCAL);
      System.setProperty("kafka.clusters.0.bootstrapServers", kafka.getBootstrapServers());
      System.setProperty("kafka.clusters.0.schemaRegistry", schemaRegistry.getUrl());
      System.setProperty("kafka.clusters.0.kafkaConnect.0.name", "kafka-connect");
      System.setProperty("kafka.clusters.0.kafkaConnect.0.address", kafkaConnect.getTarget());

      System.setProperty("kafka.clusters.1.name", SECOND_LOCAL);
      System.setProperty("kafka.clusters.1.readOnly", "true");
      System.setProperty("kafka.clusters.1.bootstrapServers", kafka.getBootstrapServers());
      System.setProperty("kafka.clusters.1.schemaRegistry", schemaRegistry.getUrl());
      System.setProperty("kafka.clusters.1.kafkaConnect.0.name", "kafka-connect");
      System.setProperty("kafka.clusters.1.kafkaConnect.0.address", kafkaConnect.getTarget());
    }
  }

  public static void createTopic(NewTopic topic) {
    withAdminClient(client -> client.createTopics(List.of(topic)).all().get());
  }

  public static void deleteTopic(String topic) {
    withAdminClient(client -> client.deleteTopics(List.of(topic)).all().get());
  }

  private static void withAdminClient(ThrowingConsumer<AdminClient> consumer) {
    Properties properties = new Properties();
    properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
    try (var client = AdminClient.create(properties)) {
      try {
        consumer.accept(client);
      } catch (Throwable throwable) {
        throw new RuntimeException(throwable);
      }
    }
  }

  @Autowired
  protected ConfigurableApplicationContext applicationContext;

}
