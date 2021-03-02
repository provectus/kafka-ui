package com.provectus.kafka.ui;

import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.utility.DockerImageName;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public abstract class AbstractBaseTest {
    public static String LOCAL = "local";
    public static String SECOND_LOCAL = "secondLocal";

    private static final String CONFLUENT_PLATFORM_VERSION = "5.2.1";

    public static final KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka").withTag(CONFLUENT_PLATFORM_VERSION))
            .withNetwork(Network.SHARED);

    public static final SchemaRegistryContainer schemaRegistry = new SchemaRegistryContainer(CONFLUENT_PLATFORM_VERSION)
            .withKafka(kafka)
            .dependsOn(kafka);

    public static final KafkaConnectContainer kafkaConnect = new KafkaConnectContainer(CONFLUENT_PLATFORM_VERSION)
            .withKafka(kafka)
            .dependsOn(kafka)
            .dependsOn(schemaRegistry);

    static {
        kafka.start();
        schemaRegistry.start();
        kafkaConnect.start();
    }

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(@NotNull ConfigurableApplicationContext context) {
            System.setProperty("kafka.clusters.0.name", LOCAL);
            System.setProperty("kafka.clusters.0.bootstrapServers", kafka.getBootstrapServers());
            System.setProperty("kafka.clusters.0.schemaRegistry", schemaRegistry.getTarget());
            System.setProperty("kafka.clusters.0.kafkaConnect.0.name", "kafka-connect");
            System.setProperty("kafka.clusters.0.kafkaConnect.0.address", kafkaConnect.getTarget());

            System.setProperty("kafka.clusters.1.name", SECOND_LOCAL);
            System.setProperty("kafka.clusters.1.readOnly", "true");
            System.setProperty("kafka.clusters.1.bootstrapServers", kafka.getBootstrapServers());
            System.setProperty("kafka.clusters.1.schemaRegistry", schemaRegistry.getTarget());
            System.setProperty("kafka.clusters.1.kafkaConnect.0.name", "kafka-connect");
            System.setProperty("kafka.clusters.1.kafkaConnect.0.address", kafkaConnect.getTarget());
        }
    }
}
