package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.NewConnector;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.util.Map;
import java.util.UUID;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "60000")
public class KafkaConnectTest extends AbstractBaseTest {
    private final String clusterName = "local";
    private final String connectorName = UUID.randomUUID().toString();

    @Autowired
    private WebTestClient webTestClient;


    @BeforeEach
    public void setUp() {
        webTestClient.post()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connectors", clusterName)
                .bodyValue(new NewConnector()
                        .name(connectorName)
                        .config(Map.of(
                                "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
                                "tasks.max", "1",
                                "topics", "output-topic",
                                "file", "/tmp/test"
                        ))
                )
                .exchange()
                .expectStatus().isOk();
    }

    @AfterEach
    public void tearDown() {
        webTestClient.delete()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connectors/{connectorName}", clusterName, connectorName)
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    public void shouldListConnectors() {
        webTestClient.get()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connectors", clusterName)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath(String.format("$[?(@ == '%s')]", connectorName))
                .exists();
    }
}
