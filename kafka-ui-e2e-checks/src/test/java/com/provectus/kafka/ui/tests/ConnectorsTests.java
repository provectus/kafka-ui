package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.extensions.FileUtils;
import com.provectus.kafka.ui.helpers.ApiHelper;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.steps.kafka.connectorssteps.ConnectorsSteps;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qase.api.annotation.CaseId;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.provectus.kafka.ui.steps.kafka.connectorssteps.ConnectorConstance.*;

public class ConnectorsTests extends BaseTest {

    private final long suiteId = 10;
    private final String suiteTitle = "Kafka Connect";

    @BeforeAll
    @SneakyThrows
    public static void beforeAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;

        String connectorToDelete = FileUtils.getResourceAsString("delete_connector_config.json");
        String connectorToUpdate = FileUtils.getResourceAsString("config_for_create_connector_via_api.json");
        String message = FileUtils.getResourceAsString("message_content_create_topic.json");

        apiHelper.deleteTopic(LOCAL_CLUSTER, CONNECTOR_FOR_DELETE);

        apiHelper.createTopic(LOCAL_CLUSTER, TOPIC_FOR_CONNECTOR);
        apiHelper.sendMessage(LOCAL_CLUSTER, TOPIC_FOR_CONNECTOR, message, " ");

        apiHelper.createTopic(LOCAL_CLUSTER, TOPIC_FOR_DELETE_CONNECTOR);
        apiHelper.sendMessage(LOCAL_CLUSTER, TOPIC_FOR_DELETE_CONNECTOR, message, " ");

        apiHelper.createTopic(LOCAL_CLUSTER, TOPIC_FOR_UPDATE_CONNECTOR);
        apiHelper.sendMessage(LOCAL_CLUSTER, TOPIC_FOR_UPDATE_CONNECTOR, message, " ");

        apiHelper.createConnector(LOCAL_CLUSTER, FIRST_CONNECTOR, CONNECTOR_FOR_DELETE, connectorToDelete);
        apiHelper.createConnector(LOCAL_CLUSTER, FIRST_CONNECTOR, CONNECTOR_FOR_UPDATE, connectorToUpdate);
    }

    @AfterAll
    @SneakyThrows
    public static void afterAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;
        apiHelper.deleteConnector(LOCAL_CLUSTER, FIRST_CONNECTOR, SINK_CONNECTOR);
        apiHelper.deleteConnector(LOCAL_CLUSTER, FIRST_CONNECTOR, CONNECTOR_FOR_UPDATE);
        apiHelper.deleteTopic(LOCAL_CLUSTER, TOPIC_FOR_CONNECTOR);
        apiHelper.deleteTopic(LOCAL_CLUSTER, TOPIC_FOR_DELETE_CONNECTOR);
        apiHelper.deleteTopic(LOCAL_CLUSTER, TOPIC_FOR_UPDATE_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should create a connector")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(42)
    @Test
    public void createConnector() {
        ConnectorsSteps.INSTANCE.openPage(LOCAL_CLUSTER)
                .createConnector()
                .isConnectorVisible(SINK_CONNECTOR, TOPIC_FOR_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should update a connector")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(196)
    @Test
    public void updateConnector() {
        ConnectorsSteps.INSTANCE.openPage(LOCAL_CLUSTER)
                .openConnector(CONNECTOR_FOR_UPDATE)
                .updateConnector()
                .isConnectorVisible(CONNECTOR_FOR_UPDATE, TOPIC_FOR_UPDATE_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should delete connector")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(195)
    @Test
    public void deleteConnector() {
        ConnectorsSteps.INSTANCE.openPage(LOCAL_CLUSTER)
                .openConnector(CONNECTOR_FOR_DELETE)
                .deleteConnector()
                .connectorIsNotVisible(CONNECTOR_FOR_DELETE);
    }
}
