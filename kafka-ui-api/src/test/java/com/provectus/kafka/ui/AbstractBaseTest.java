package com.provectus.kafka.ui;

import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
public abstract class AbstractBaseTest {
    @Container
    public static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:5.2.1"))
            .withNetwork(Network.SHARED);
    @Container
    public static SchemaRegistryContainer schemaRegistry = new SchemaRegistryContainer("5.2.1")
            .withKafka(kafka)
            .dependsOn(kafka);

    public static KafkaConnectContainer kafkaConnect = new KafkaConnectContainer("5.2.1")
            .withKafka(kafka)
            .dependsOn(kafka);

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext context) {
            System.setProperty("kafka.clusters.0.name", "local");
            System.setProperty("kafka.clusters.0.schemaRegistry", schemaRegistry.getTarget());
            System.setProperty("kafka.clusters.0.kafkaConnect", kafkaConnect.getTarget());
        }
    }
}
