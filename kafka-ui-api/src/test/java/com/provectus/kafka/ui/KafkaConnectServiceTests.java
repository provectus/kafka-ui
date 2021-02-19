package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.*;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "60000")
public class KafkaConnectServiceTests extends AbstractBaseTest {
    private final String clusterName = "local";
    private final String connectName = "local-connect";
    private final String connectorName = UUID.randomUUID().toString();
    private final Map<String, Object> config = Map.of(
            "name", connectorName,
            "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
            "tasks.max", "1",
            "topics", "output-topic",
            "file", "/tmp/test"
    );

    @Autowired
    private WebTestClient webTestClient;


    @BeforeEach
    public void setUp() {
        webTestClient.post()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/connectors", clusterName, connectName)
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
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/connectors/{connectorName}", clusterName, connectName, connectorName)
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    public void shouldListConnectors() {
        webTestClient.get()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/connectors", clusterName, connectName)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath(String.format("$[?(@ == '%s')]", connectorName))
                .exists();
    }

    @Test
    public void shouldReturnNotFoundForNonExistingCluster() {
        webTestClient.get()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/connectors", "nonExistingCluster", connectName)
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    public void shouldReturnNotFoundForNonExistingConnectName() {
        webTestClient.get()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/connectors", clusterName, "nonExistingConnect")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    public void shouldRetrieveConnector() {
        Connector expected = (Connector) new Connector()
                .status(new ConnectorStatus()
                        .state(ConnectorStatus.StateEnum.RUNNING)
                        .workerId("kafka-connect0:8083"))
                .tasks(List.of(new TaskId()
                                .connector(connectorName)
                                .task(0)))
                .type(Connector.TypeEnum.SINK)
                .name(connectorName)
                .config(config);
        webTestClient.get()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/connectors/{connectorName}", clusterName, connectName, connectorName)
                .exchange()
                .expectStatus().isOk()
                .expectBody(Connector.class)
                .value(connector -> assertEquals(expected, connector));
    }

    @Test
    public void shouldUpdateConfig() {
        webTestClient.put()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/connectors/{connectorName}/config", clusterName, connectName, connectorName)
                .bodyValue(Map.of(
                        "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
                        "tasks.max", "1",
                        "topics", "another-topic",
                        "file", "/tmp/new"
                        )
                )
                .exchange()
                .expectStatus().isOk();

        webTestClient.get()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/connectors/{connectorName}/config", clusterName, connectName, connectorName)
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .isEqualTo(Map.of(
                        "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
                        "tasks.max", "1",
                        "topics", "another-topic",
                        "file", "/tmp/new",
                        "name", connectorName
                ));
    }

    @Test
    public void shouldRetrieveConnectorPlugins() {
        webTestClient.get()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/plugins", clusterName, connectName)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(ConnectorPlugin.class)
                .value(plugins -> assertEquals(13, plugins.size()));
    }

    @Test
    public void shouldSuccessfullyValidateConnectorPluginConfiguration() {
        var pluginName = "FileStreamSinkConnector";
        webTestClient.put()
                .uri("http://localhost:8080/api/clusters/{clusterName}/connect/{connectName}/plugins/{pluginName}/config/validate", clusterName, connectName, pluginName)
                .bodyValue(Map.of(
                        "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
                        "tasks.max", "1",
                        "topics", "output-topic",
                        "file", "/tmp/test",
                        "name", connectorName
                        )
                )
                .exchange()
                .expectStatus().isOk()
                .expectBody(ConnectorPluginConfigValidationResponse.class)
                .value(response -> assertEquals(0, response.getErrorCount()));
    }

}
