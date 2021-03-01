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
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public abstract class AbstractBaseTest {
    private static final String CONFLUENT_PLATFORM_VERSION = "5.2.1";

    public static final KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka").withTag(CONFLUENT_PLATFORM_VERSION))
            .withNetwork(Network.SHARED);

    public static final SchemaRegistryContainer schemaRegistry = new SchemaRegistryContainer(CONFLUENT_PLATFORM_VERSION)
            .withKafka(kafka)
            .dependsOn(kafka);

    public static final KafkaConnectContainer kafkaConnect = new KafkaConnectContainer(CONFLUENT_PLATFORM_VERSION)
            .withKafka(kafka)
            .waitingFor(Wait.forHttp("/"))
            .dependsOn(kafka)
            .dependsOn(schemaRegistry)
            .withStartupTimeout(Duration.ofMinutes(15));

    static {
        kafka.start();
        schemaRegistry.start();
        kafkaConnect.start();
    }

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(@NotNull ConfigurableApplicationContext context) {
            System.setProperty("kafka.clusters.0.name", "local");
            System.setProperty("kafka.clusters.0.bootstrapServers", kafka.getBootstrapServers());
            System.setProperty("kafka.clusters.0.schemaRegistry", schemaRegistry.getTarget());
            System.setProperty("kafka.clusters.0.kafkaConnect.0.name", "kafka-connect");
            System.setProperty("kafka.clusters.0.kafkaConnect.0.address", kafkaConnect.getTarget());
        }
    }
}
