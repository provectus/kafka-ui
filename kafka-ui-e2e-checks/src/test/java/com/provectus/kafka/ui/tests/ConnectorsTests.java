package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.models.Connector;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qase.api.annotation.CaseId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static com.provectus.kafka.ui.extensions.FileUtils.getResourceAsString;

public class ConnectorsTests extends BaseTest {
    private static final long SUITE_ID = 10;
    private static final String SUITE_TITLE = "Kafka Connect";
    private static final String CONNECT_NAME = "first";
    private static final List<Topic> TOPIC_LIST = new ArrayList<>();
    private static final List<Connector> CONNECTOR_LIST = new ArrayList<>();
    private static final String MESSAGE_CONTENT = "message_content_create_topic.json";
    private static final String MESSAGE_KEY = " ";
    private static final Topic TOPIC_FOR_CREATE = new Topic()
            .setName("topic_for_create_connector")
            .setMessageContent(MESSAGE_CONTENT).setMessageKey(MESSAGE_KEY);
    private static final Topic TOPIC_FOR_DELETE = new Topic()
            .setName("topic_for_delete_connector")
            .setMessageContent(MESSAGE_CONTENT).setMessageKey(MESSAGE_KEY);
    private static final Topic TOPIC_FOR_UPDATE = new Topic()
            .setName("topic_for_update_connector")
            .setMessageContent(MESSAGE_CONTENT).setMessageKey(MESSAGE_KEY);
    private static final Connector CONNECTOR_FOR_DELETE = new Connector()
            .setName("sink_postgres_activities_e2e_checks_for_delete")
            .setConfig(getResourceAsString("delete_connector_config.json"));
    private static final Connector CONNECTOR_FOR_UPDATE = new Connector()
            .setName("sink_postgres_activities_e2e_checks_for_update")
            .setConfig(getResourceAsString("config_for_create_connector_via_api.json"));

    @BeforeAll
    public static void beforeAll() {
        TOPIC_LIST.addAll(List.of(TOPIC_FOR_CREATE, TOPIC_FOR_DELETE, TOPIC_FOR_UPDATE));
        TOPIC_LIST.forEach(topic -> {
            Helpers.INSTANCE.apiHelper.createTopic(CLUSTER_NAME, topic.getName());
            Helpers.INSTANCE.apiHelper.sendMessage(CLUSTER_NAME, topic);
        });
        CONNECTOR_LIST.addAll(List.of(CONNECTOR_FOR_DELETE, CONNECTOR_FOR_UPDATE));
        CONNECTOR_LIST.forEach(connector -> Helpers.INSTANCE.apiHelper
                .createConnector(CLUSTER_NAME, CONNECT_NAME, connector));
    }

    @DisplayName("should create a connector")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(42)
    @Test
    public void createConnector() {
        Connector connectorForCreate = new Connector()
                .setName("sink_postgres_activities_e2e_checks")
                .setConfig(getResourceAsString("config_for_create_connector.json"));
        pages.openConnectorsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .clickCreateConnectorButton()
                .waitUntilScreenReady()
                .setConnectorConfig(connectorForCreate.getName(), connectorForCreate.getConfig());
        pages.openConnectorsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .connectorIsVisibleInList(connectorForCreate.getName(), TOPIC_FOR_CREATE.getName());
        CONNECTOR_LIST.add(connectorForCreate);
    }

    @DisplayName("should update a connector")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(196)
    @Test
    public void updateConnector() {
        pages.openConnectorsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openConnector(CONNECTOR_FOR_UPDATE.getName());
        pages.connectorsView.connectorIsVisibleOnOverview();
        pages.connectorsView.openEditConfig()
                .updConnectorConfig(CONNECTOR_FOR_UPDATE.getConfig());
        pages.openConnectorsList(CLUSTER_NAME)
                .connectorIsVisibleInList(CONNECTOR_FOR_UPDATE.getName(), TOPIC_FOR_UPDATE.getName());
    }

    @DisplayName("should delete connector")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(195)
    @Test
    public void deleteConnector() {
        pages.openConnectorsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openConnector(CONNECTOR_FOR_DELETE.getName());
        pages.connectorsView.clickDeleteButton();
        pages.openConnectorsList(CLUSTER_NAME)
                .isNotVisible(CONNECTOR_FOR_DELETE.getName());
        CONNECTOR_LIST.remove(CONNECTOR_FOR_DELETE);
    }

    @AfterAll
    public static void afterAll() {
        CONNECTOR_LIST.forEach(connector ->
                Helpers.INSTANCE.apiHelper.deleteConnector(CLUSTER_NAME, CONNECT_NAME, connector.getName()));
        TOPIC_LIST.forEach(topic -> Helpers.INSTANCE.apiHelper.deleteTopic(CLUSTER_NAME, topic.getName()));
    }
}
