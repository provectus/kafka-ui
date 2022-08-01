package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.extensions.FileUtils;
import com.provectus.kafka.ui.helpers.ApiHelper;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import io.qase.api.annotation.CaseId;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;

public class ConnectorsTests extends BaseTest {

    private final long suiteId = 10;
    private final String suiteTitle = "Kafka Connect";
    public static final String LOCAL_CLUSTER = "local";
    public static final String SINK_CONNECTOR = "sink_postgres_activities_e2e_checks";
    public static final String TOPIC_FOR_CONNECTOR = "topic_for_connector";
    public static final String TOPIC_FOR_DELETE_CONNECTOR = "topic_for_delete_connector";
    public static final String TOPIC_FOR_UPDATE_CONNECTOR = "topic_for_update_connector";
    public static final String FIRST_CONNECTOR = "first";
    public static final String CONNECTOR_FOR_DELETE = "sink_postgres_activities_e2e_checks_for_delete";
    public static final String CONNECTOR_FOR_UPDATE = "sink_postgres_activities_e2e_checks_for_update";

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
        pages.openConnectorsList(LOCAL_CLUSTER)
                .isOnPage()
                .clickCreateConnectorButton()
                .isOnConnectorCreatePage()
                .setConnectorConfig(
                        SINK_CONNECTOR,
                        FileUtils.getResourceAsString("config_for_create_connector.json"));
        pages.openConnectorsList(LOCAL_CLUSTER)
                .isOnPage()
                .connectorIsVisibleInList(SINK_CONNECTOR, TOPIC_FOR_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should update a connector")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(196)
    @Test
    public void updateConnector() {
        pages.openConnectorsList(LOCAL_CLUSTER)
                .isOnPage()
                .openConnector(CONNECTOR_FOR_UPDATE);
        pages.connectorsView.connectorIsVisibleOnOverview();
        pages.connectorsView.openEditConfig()
                .updConnectorConfig(FileUtils.getResourceAsString("config_for_update_connector.json"));
        pages.openConnectorsList(LOCAL_CLUSTER)
                .connectorIsVisibleInList(CONNECTOR_FOR_UPDATE, TOPIC_FOR_UPDATE_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should delete connector")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(195)
    @Test
    public void deleteConnector() {
        pages.openConnectorsList(LOCAL_CLUSTER)
                .isOnPage()
                .openConnector(CONNECTOR_FOR_DELETE);
        pages.connectorsView.clickDeleteButton();
        pages.openConnectorsList(LOCAL_CLUSTER)
                .isNotVisible(CONNECTOR_FOR_DELETE);
    }
}
