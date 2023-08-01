package com.provectus.kafka.ui;

import com.provectus.kafka.ui.container.KafkaConnectContainer;
import com.provectus.kafka.ui.container.KsqlDbContainer;
import com.provectus.kafka.ui.container.SchemaRegistryContainer;
import java.nio.file.Path;
import java.util.List;
import java.util.Properties;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.function.ThrowingConsumer;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.util.TestSocketUtils;
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

  private static final String CONFLUENT_PLATFORM_VERSION = "7.2.1"; // Append ".arm64" for a local run

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

  protected static final KsqlDbContainer KSQL_DB = new KsqlDbContainer(
      DockerImageName.parse("confluentinc/cp-ksqldb-server")
          .withTag(CONFLUENT_PLATFORM_VERSION))
      .withKafka(kafka);

  @TempDir
  public static Path tmpDir;

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
      // List unavailable hosts to verify failover
      System.setProperty("kafka.clusters.0.schemaRegistry", String.format("http://localhost:%1$s,http://localhost:%1$s,%2$s",
              TestSocketUtils.findAvailableTcpPort(), schemaRegistry.getUrl()));
      System.setProperty("kafka.clusters.0.kafkaConnect.0.name", "kafka-connect");
      System.setProperty("kafka.clusters.0.kafkaConnect.0.userName", "kafka-connect");
      System.setProperty("kafka.clusters.0.kafkaConnect.0.password", "kafka-connect");
      System.setProperty("kafka.clusters.0.kafkaConnect.0.address", kafkaConnect.getTarget());
      System.setProperty("kafka.clusters.0.kafkaConnect.1.name", "notavailable");
      System.setProperty("kafka.clusters.0.kafkaConnect.1.address", "http://notavailable:6666");
      System.setProperty("kafka.clusters.0.masking.0.type", "REPLACE");
      System.setProperty("kafka.clusters.0.masking.0.replacement", "***");
      System.setProperty("kafka.clusters.0.masking.0.topicValuesPattern", "masking-test-.*");
      System.setProperty("kafka.clusters.0.audit.topicAuditEnabled", "true");
      System.setProperty("kafka.clusters.0.audit.consoleAuditEnabled", "true");

      System.setProperty("kafka.clusters.1.name", SECOND_LOCAL);
      System.setProperty("kafka.clusters.1.readOnly", "true");
      System.setProperty("kafka.clusters.1.bootstrapServers", kafka.getBootstrapServers());
      System.setProperty("kafka.clusters.1.schemaRegistry", schemaRegistry.getUrl());
      System.setProperty("kafka.clusters.1.kafkaConnect.0.name", "kafka-connect");
      System.setProperty("kafka.clusters.1.kafkaConnect.0.address", kafkaConnect.getTarget());

      System.setProperty("dynamic.config.enabled", "true");
      System.setProperty("config.related.uploads.dir", tmpDir.toString());
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
