package com.provectus.kafka.ui;

import static java.util.function.Predicate.not;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.provectus.kafka.ui.model.Connector;
import com.provectus.kafka.ui.model.ConnectorPlugin;
import com.provectus.kafka.ui.model.ConnectorPluginConfig;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValidationResponse;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValue;
import com.provectus.kafka.ui.model.ConnectorStatus;
import com.provectus.kafka.ui.model.ConnectorTaskStatus;
import com.provectus.kafka.ui.model.ConnectorType;
import com.provectus.kafka.ui.model.NewConnector;
import com.provectus.kafka.ui.model.TaskId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "60000")
public class KafkaConnectServiceTests extends AbstractBaseTest {
  private final String connectName = "kafka-connect";
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
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors", LOCAL, connectName)
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
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors/{connectorName}", LOCAL,
            connectName, connectorName)
        .exchange()
        .expectStatus().isOk();
  }

  @Test
  public void shouldListConnectors() {
    webTestClient.get()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors", LOCAL, connectName)
        .exchange()
        .expectStatus().isOk()
        .expectBody()
        .jsonPath(String.format("$[?(@ == '%s')]", connectorName))
        .exists();
  }

  @Test
  public void shouldReturnNotFoundForNonExistingCluster() {
    webTestClient.get()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors", "nonExistingCluster",
            connectName)
        .exchange()
        .expectStatus().isNotFound();
  }

  @Test
  public void shouldReturnNotFoundForNonExistingConnectName() {
    webTestClient.get()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors", LOCAL,
            "nonExistingConnect")
        .exchange()
        .expectStatus().isNotFound();
  }

  @Test
  public void shouldRetrieveConnector() {
    Connector expected = (Connector) new Connector()
        .connect(connectName)
        .status(new ConnectorStatus()
            .state(ConnectorTaskStatus.RUNNING)
            .workerId("kafka-connect:8083"))
        .tasks(List.of(new TaskId()
            .connector(connectorName)
            .task(0)))
        .type(ConnectorType.SINK)
        .name(connectorName)
        .config(config);
    webTestClient.get()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors/{connectorName}", LOCAL,
            connectName, connectorName)
        .exchange()
        .expectStatus().isOk()
        .expectBody(Connector.class)
        .value(connector -> assertEquals(expected, connector));
  }

  @Test
  public void shouldUpdateConfig() {
    webTestClient.put()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors/{connectorName}/config",
            LOCAL, connectName, connectorName)
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
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors/{connectorName}/config",
            LOCAL, connectName, connectorName)
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
  public void shouldReturn400WhenConnectReturns400ForInvalidConfigCreate() {
    var connectorName = UUID.randomUUID().toString();
    webTestClient.post()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors", LOCAL, connectName)
        .bodyValue(Map.of(
            "name", connectorName,
            "config", Map.of(
                "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
                "tasks.max", "invalid number",
                "topics", "another-topic",
                "file", "/tmp/test"
            ))
        )
        .exchange()
        .expectStatus().isBadRequest();

    webTestClient.get()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors", LOCAL, connectName)
        .exchange()
        .expectStatus().isOk()
        .expectBody()
        .jsonPath(String.format("$[?(@ == '%s')]", connectorName))
        .doesNotExist();
  }

  @Test
  public void shouldReturn400WhenConnectReturns500ForInvalidConfigCreate() {
    var connectorName = UUID.randomUUID().toString();
    webTestClient.post()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors", LOCAL, connectName)
        .bodyValue(Map.of(
            "name", connectorName,
            "config", Map.of(
                "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector"
            ))
        )
        .exchange()
        .expectStatus().isBadRequest();

    webTestClient.get()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors", LOCAL, connectName)
        .exchange()
        .expectStatus().isOk()
        .expectBody()
        .jsonPath(String.format("$[?(@ == '%s')]", connectorName))
        .doesNotExist();
  }


  @Test
  public void shouldReturn400WhenConnectReturns400ForInvalidConfigUpdate() {
    webTestClient.put()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors/{connectorName}/config",
            LOCAL, connectName, connectorName)
        .bodyValue(Map.of(
            "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
            "tasks.max", "invalid number",
            "topics", "another-topic",
            "file", "/tmp/test"
            )
        )
        .exchange()
        .expectStatus().isBadRequest();

    webTestClient.get()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors/{connectorName}/config",
            LOCAL, connectName, connectorName)
        .exchange()
        .expectStatus().isOk()
        .expectBody(new ParameterizedTypeReference<Map<String, Object>>() {
        })
        .isEqualTo(Map.of(
            "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
            "tasks.max", "1",
            "topics", "output-topic",
            "file", "/tmp/test",
            "name", connectorName
        ));
  }

  @Test
  public void shouldReturn400WhenConnectReturns500ForInvalidConfigUpdate() {
    webTestClient.put()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors/{connectorName}/config",
            LOCAL, connectName, connectorName)
        .bodyValue(Map.of(
            "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector"
            )
        )
        .exchange()
        .expectStatus().isBadRequest();

    webTestClient.get()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/connectors/{connectorName}/config",
            LOCAL, connectName, connectorName)
        .exchange()
        .expectStatus().isOk()
        .expectBody(new ParameterizedTypeReference<Map<String, Object>>() {
        })
        .isEqualTo(Map.of(
            "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
            "tasks.max", "1",
            "topics", "output-topic",
            "file", "/tmp/test",
            "name", connectorName
        ));
  }

  @Test
  public void shouldRetrieveConnectorPlugins() {
    webTestClient.get()
        .uri("/api/clusters/{clusterName}/connects/{connectName}/plugins", LOCAL, connectName)
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(ConnectorPlugin.class)
        .value(plugins -> assertEquals(14, plugins.size()));
  }

  @Test
  public void shouldSuccessfullyValidateConnectorPluginConfiguration() {
    var pluginName = "FileStreamSinkConnector";
    var path =
        "/api/clusters/{clusterName}/connects/{connectName}/plugins/{pluginName}/config/validate";
    webTestClient.put()
        .uri(path, LOCAL, connectName, pluginName)
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

  @Test
  public void shouldValidateAndReturnErrorsOfConnectorPluginConfiguration() {
    var pluginName = "FileStreamSinkConnector";
    var path =
        "/api/clusters/{clusterName}/connects/{connectName}/plugins/{pluginName}/config/validate";
    webTestClient.put()
        .uri(path, LOCAL, connectName, pluginName)
        .bodyValue(Map.of(
            "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
            "tasks.max", "0",
            "topics", "output-topic",
            "file", "/tmp/test",
            "name", connectorName
            )
        )
        .exchange()
        .expectStatus().isOk()
        .expectBody(ConnectorPluginConfigValidationResponse.class)
        .value(response -> {
          assertEquals(1, response.getErrorCount());
          var error = response.getConfigs().stream()
              .map(ConnectorPluginConfig::getValue)
              .map(ConnectorPluginConfigValue::getErrors)
              .filter(not(List::isEmpty))
              .findFirst().get();
          assertEquals(
              "Invalid value 0 for configuration tasks.max: Value must be at least 1",
              error.get(0)
          );
        });
  }
}
