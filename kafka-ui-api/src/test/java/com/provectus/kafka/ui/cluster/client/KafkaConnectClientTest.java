package com.provectus.kafka.ui.cluster.client;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.*;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
public class KafkaConnectClientTest extends AbstractBaseTest {
    private final String clusterName = "local";
    private final String connectorName = UUID.randomUUID().toString();

    private static final Duration DEFAULT_DELAY = Duration.ofSeconds(3);

    @Autowired
    private KafkaConnectClient kafkaConnectClient;

    @BeforeEach
    public void setUp() {
        kafkaConnectClient.createConnector(clusterName, Mono.just(new NewConnector()
                .name(connectorName)
                .config(Map.of(
                        "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
                        "tasks.max", "1",
                        "topics", "output-topic",
                        "file", "/tmp/test"
                ))
        )).block();
    }

    @AfterEach
    public void tearDown() {
        kafkaConnectClient.deleteConnector(clusterName, connectorName)
                .block();
    }

    @Test
    public void shouldCreateConnector() {
        assertThat(kafkaConnectClient.getConnectors(clusterName).block())
                .contains(connectorName);
    }

    @Test
    public void shouldUpdateConfig() {
        kafkaConnectClient.setConnectorConfig(clusterName, connectorName, Mono.just(Map.of(
                "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
                "tasks.max", "1",
                "topics", "output-topic",
                "file", "/tmp/newTest"
        ))).block();
        assertThat(
                kafkaConnectClient.getConnectorConfig(clusterName, connectorName)
                        .map(c -> c.get("file"))
                        .block()
        ).isEqualTo("/tmp/newTest");
    }

    @Test
    public void shouldPauseConnector() {
        kafkaConnectClient.pauseConnector(clusterName, connectorName)
                .block();
        assertThat(
                Mono.delay(DEFAULT_DELAY)
                        .flatMap(ignore ->
                                kafkaConnectClient.getConnectorStatus(clusterName, connectorName)
                        )
                        .map(ConnectorStatus::getConnector)
                        .map(ConnectorStatusConnector::getState)
                        .block()
        ).isEqualTo(ConnectorStatusConnector.StateEnum.PAUSED);
    }

    @Test
    public void shouldResumeConnector() {
        shouldPauseConnector();
        kafkaConnectClient.resumeConnector(clusterName, connectorName)
                .block();
        assertThat(
                Mono.delay(DEFAULT_DELAY)
                        .flatMap(ignore ->
                                kafkaConnectClient.getConnectorStatus(clusterName, connectorName)
                        )
                        .map(ConnectorStatus::getConnector)
                        .map(ConnectorStatusConnector::getState)
                        .block()
        ).isEqualTo(ConnectorStatusConnector.StateEnum.RUNNING);
    }

    @Test
    public void shouldRestartConnector() {
        kafkaConnectClient.restartConnector(clusterName, connectorName)
                .block();
        assertThat(
                Mono.delay(DEFAULT_DELAY.plusSeconds(3))
                        .flatMap(ignore ->
                                kafkaConnectClient.getConnectorStatus(clusterName, connectorName)
                        )
                        .map(ConnectorStatus::getConnector)
                        .map(ConnectorStatusConnector::getState)
                        .block()
        ).isEqualTo(ConnectorStatusConnector.StateEnum.RUNNING);
    }

    @Test
    public void shouldRetrieveTasks() {
        assertThat(
                getConnectorTasks()
                        .stream()
                        .map(ConnectorTask::getConfig)
                        .map(config -> config.get("task.class"))
                        .collect(Collectors.toList())
        )
                .hasSize(1)
                .allMatch("org.apache.kafka.connect.file.FileStreamSinkTask"::equals);
    }

    @Test
    public void shouldRetrieveTaskStatus() {
        var taskId = getConnectorTasks().stream()
                .map(ConnectorTask::getId)
                .map(Task::getTask)
                .findFirst().orElseThrow();
        assertThat(
                kafkaConnectClient.getConnectorTaskStatus(clusterName, connectorName, taskId)
                        .map(TaskStatus::getState).block()
        ).isEqualTo(TaskStatus.StateEnum.RUNNING);
    }


    @Test
    public void shouldRestartTask() {
        var taskId = getConnectorTasks().stream()
                .map(ConnectorTask::getId)
                .map(Task::getTask)
                .findFirst().orElseThrow();
        kafkaConnectClient.restartConnectorTask(clusterName, connectorName, taskId)
                .block();
        assertThat(
                Mono.delay(DEFAULT_DELAY).flatMap(ignore ->
                        kafkaConnectClient.getConnectorTaskStatus(clusterName, connectorName, taskId))
                        .map(TaskStatus::getState).block()
        ).isEqualTo(TaskStatus.StateEnum.RUNNING);
    }

    @Test
    public void shouldRetrieveConnectorPlugins() {
        var plugins = kafkaConnectClient.getConnectorPlugins(clusterName).block().collectList().block();
        assertThat(plugins).isNotEmpty().hasSize(13);
    }

    @Test
    public void shouldSuccessfullyValidateConnectorPluginConfiguration() {
        var validationResponse = kafkaConnectClient.validateConnectorPluginConfig(clusterName, "FileStreamSourceConnector", Mono.just(
                Map.of(
                        "connector.class", "org.apache.kafka.connect.file.FileStreamSourceConnector",
                        "name", "file-source",
                        "tasks.max", "1",
                        "topic", "first.messages",
                        "file", "/tmp/test.txt"
                )
        )).block();
        assertThat(validationResponse.getErrorCount())
                .isEqualTo(0);
    }

    @Test
    public void shouldValidateConnectorPluginConfigurationWithErrors() {
        StepVerifier.create(
                kafkaConnectClient.validateConnectorPluginConfig(clusterName, "FileStreamSourceConnector", Mono.just(
                        Map.of(
                                "connector.class", "org.apache.kafka.connect.file.NonExistingClass"
                        )
                ))
        ).expectError()
                .verify();
    }

    private List<ConnectorTask> getConnectorTasks() {
        return kafkaConnectClient.getConnectorTasks(clusterName, connectorName)
                .collectList().block();
    }

}