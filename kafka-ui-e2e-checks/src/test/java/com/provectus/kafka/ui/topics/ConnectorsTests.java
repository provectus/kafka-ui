package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.extensions.FileUtils;
import com.provectus.kafka.ui.helpers.Helpers;
import lombok.SneakyThrows;
import org.junit.jupiter.api.*;

public class ConnectorsTests extends BaseTest {

    public static final String LOCAL = "local";
    public static final String SINK_CONNECTOR = "sink_postgres_activities_e2e_checks";
    public static final String TOPIC_FOR_CONNECTOR = "topic_for_connector";
    public static final String TOPIC_FOR_UPDATE_CONNECTOR = "topic_for_update_connector";
    public static final String TOPIC_FOR_DELETE_CONNECTOR = "topic_for_delete_connector";
    public static final String FIRST = "first";
    public static final String CONNECTOR_FOR_DELETE = "sink_postgres_activities_e2e_checks_for_delete";
    public static final String CONNECTOR_FOR_UPDATE = "sink_postgres_activities_e2e_checks_for_update";

    @BeforeAll
    @SneakyThrows
    public static void beforeAll() {
        Helpers.INSTANCE.apiHelper.createTopic(LOCAL, TOPIC_FOR_CONNECTOR);
        Helpers.INSTANCE.apiHelper.sendMessage(LOCAL, TOPIC_FOR_CONNECTOR,
                FileUtils.getResourceAsString("message_content_create_topic.json"), " ");
        Helpers.INSTANCE.apiHelper.createTopic(LOCAL, TOPIC_FOR_UPDATE_CONNECTOR);
        Helpers.INSTANCE.apiHelper.sendMessage(LOCAL, TOPIC_FOR_UPDATE_CONNECTOR,
                FileUtils.getResourceAsString("message_content_create_topic.json"), " ");
        Helpers.INSTANCE.apiHelper.createConnector(LOCAL, FIRST, CONNECTOR_FOR_UPDATE,
                FileUtils.getResourceAsString("config_for_create_connector_via_api.json"));
        Helpers.INSTANCE.apiHelper.createTopic(LOCAL, TOPIC_FOR_DELETE_CONNECTOR);
        Helpers.INSTANCE.apiHelper.sendMessage(LOCAL, TOPIC_FOR_DELETE_CONNECTOR,
                FileUtils.getResourceAsString("message_content_create_topic.json"), " ");
        Helpers.INSTANCE.apiHelper.createConnector(LOCAL, FIRST,
                CONNECTOR_FOR_DELETE,
                FileUtils.getResourceAsString("delete_connector_config.json"));
    }

    @AfterAll
    @SneakyThrows
    public static void afterAll() {
      Helpers.INSTANCE.apiHelper.deleteConnector(LOCAL, FIRST, SINK_CONNECTOR);
      Helpers.INSTANCE.apiHelper.deleteConnector(LOCAL, FIRST, CONNECTOR_FOR_UPDATE);
      Helpers.INSTANCE.apiHelper.deleteTopic(LOCAL, TOPIC_FOR_UPDATE_CONNECTOR);
      Helpers.INSTANCE.apiHelper.deleteTopic(LOCAL, TOPIC_FOR_DELETE_CONNECTOR);
      Helpers.INSTANCE.apiHelper.deleteTopic(LOCAL, TOPIC_FOR_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should create a connector")
    @Test
    void createConnector() {
            pages.openConnectorsList(LOCAL)
                    .isOnPage()
                    .clickCreateConnectorButton()
                    .setConnectorConfig(
                            SINK_CONNECTOR,
                            FileUtils.getResourceAsString("config_for_create_connector.json")
                    )
                    .connectorIsVisible();
            pages.openConnectorsList(LOCAL).connectorIsVisibleInList(SINK_CONNECTOR, TOPIC_FOR_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should update a connector")
    @Test
    void updateConnector() {
            pages.openConnectorsList(LOCAL)
                    .isOnPage()
                    .openConnector(CONNECTOR_FOR_UPDATE);
            pages.openConnectorsView(LOCAL, CONNECTOR_FOR_UPDATE)
                    .openEditConfig()
                    .updateConnectorConfig(
                            FileUtils.getResourceAsString("config_for_update_connector.json"));
            pages.openConnectorsList(LOCAL).connectorIsVisibleInList(CONNECTOR_FOR_UPDATE, TOPIC_FOR_UPDATE_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should delete connector")
    @Test
    void deleteConnector() {
        pages.openConnectorsList(LOCAL)
                .isOnPage()
                .openConnector(CONNECTOR_FOR_DELETE);
        pages.openConnectorsView(LOCAL, CONNECTOR_FOR_DELETE)
                .clickDeleteButton();
        pages.openConnectorsList(LOCAL).isNotVisible(CONNECTOR_FOR_DELETE);
    }
}
