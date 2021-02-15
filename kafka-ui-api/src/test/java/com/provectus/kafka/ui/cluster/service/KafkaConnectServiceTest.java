package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.ConnectorStatus;
import com.provectus.kafka.ui.model.ConnectorStatusConnector;
import com.provectus.kafka.ui.model.ConnectorTask;
import com.provectus.kafka.ui.model.NewConnector;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "10000")
@ExtendWith(SpringExtension.class)
public class KafkaConnectServiceTest extends AbstractBaseTest {
    private final String clusterName = "local";
    private final String connectorName = UUID.randomUUID().toString();

    private static final Duration DEFAULT_DELAY = Duration.ofSeconds(3);
    private static final int MAX_RETRIES = 10;

    @Autowired
    private KafkaConnectService kafkaConnectService;

    @BeforeEach
    void setUp() {
        kafkaConnectService.createConnector(clusterName, Mono.just(new NewConnector()
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
        kafkaConnectService.deleteConnector(clusterName, connectorName)
                .block();
    }

    @Test
    public void shouldCreateConnector() {
        assertThat(kafkaConnectService.getConnectors(clusterName)
                .retry(MAX_RETRIES).collectList().block())
                .anyMatch(connectorName::equals);
    }

    @Test
    public void shouldUpdateConfig() {
        kafkaConnectService.setConnectorConfig(clusterName, connectorName, Mono.just(Map.of(
                "connector.class", "org.apache.kafka.connect.file.FileStreamSinkConnector",
                "tasks.max", "1",
                "topics", "output-topic",
                "file", "/tmp/newTest"
        ))).block();
        assertThat(
                kafkaConnectService.getConnectorConfig(clusterName, connectorName)
                        .retry(MAX_RETRIES)
                        .map(c -> c.get("file"))
                        .block()
        ).isEqualTo("/tmp/newTest");
    }

    @Test
    public void shouldPauseConnector() {
        kafkaConnectService.pauseConnector(clusterName, connectorName)
                .block();
        assertThat(
                Mono.delay(DEFAULT_DELAY)
                        .flatMap(ignore ->
                                kafkaConnectService.getConnectorStatus(clusterName, connectorName)
                        )
                        .map(ConnectorStatus::getConnector)
                        .map(ConnectorStatusConnector::getState)
                        .block()
        ).isEqualTo(ConnectorStatusConnector.StateEnum.PAUSED);
    }

    @Test
    public void shouldResumeConnector() {
        shouldPauseConnector();
        kafkaConnectService.resumeConnector(clusterName, connectorName)
                .block();
        assertThat(
                Mono.delay(DEFAULT_DELAY)
                        .flatMap(ignore ->
                                kafkaConnectService.getConnectorStatus(clusterName, connectorName)
                        )
                        .retry(MAX_RETRIES)
                        .map(ConnectorStatus::getConnector)
                        .map(ConnectorStatusConnector::getState)
                        .block()
        ).isEqualTo(ConnectorStatusConnector.StateEnum.RUNNING);
    }

    @Test
    public void shouldRestartConnector() {
        kafkaConnectService.restartConnector(clusterName, connectorName)
                .retry(MAX_RETRIES)
                .block();
        assertThat(
                Mono.delay(DEFAULT_DELAY.plusSeconds(3))
                        .flatMap(ignore ->
                                kafkaConnectService.getConnectorStatus(clusterName, connectorName)
                        )
                        .retry(MAX_RETRIES)
                        .map(ConnectorStatus::getConnector)
                        .map(ConnectorStatusConnector::getState)
                        .block()
        ).isEqualTo(ConnectorStatusConnector.StateEnum.RUNNING);
    }

    @Test
    public void shouldRetrieveTasks() {
        assertThat(
                kafkaConnectService.getConnectorTasks(clusterName, connectorName)
                        .retry(MAX_RETRIES)
                        .map(ConnectorTask::getConfig)
                        .map(config -> config.get("task.class"))
                        .collectList().block()
        )
                .hasSize(1)
                .allMatch("org.apache.kafka.connect.file.FileStreamSinkTask"::equals);
    }

}