package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.extensions.FileUtils;
import com.provectus.kafka.ui.helpers.Helpers;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class ConnectorsTests extends BaseTest {

    public static final String LOCAL = "local";
    public static final String SINK_CONNECTOR = "sink_postgres_activities_e2e_checks";
    public static final String TOPIC_FOR_CONNECTOR = "topic_for_connector";
    public static final String FIRST = "first";
    public static final String CONNECTOR_FOR_DELETE = "sink_postgres_activities_e2e_checks_for_delete";
    public static final String CONNECTOR_FOR_UPDATE = "sink_postgres_activities_e2e_checks_for_update";

    @BeforeAll
    @SneakyThrows
    public static void beforeAll() {
        Helpers.INSTANCE.apiHelper.createTopic(LOCAL, TOPIC_FOR_CONNECTOR);
        Helpers.INSTANCE.apiHelper.sendMessage(LOCAL, TOPIC_FOR_CONNECTOR,
                FileUtils.getResourceAsString("message_content.json"), " ");
    }

    @AfterAll
    @SneakyThrows
    public static void afterAll() {
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
                        FileUtils.getResourceAsString("sink_activities.json")
                )
                .connectorIsVisible();
        Helpers.INSTANCE.apiHelper.deleteConnector(LOCAL, FIRST, SINK_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should update a connector")
    @Test
    void updateConnector() {
        Helpers.INSTANCE.apiHelper.createConnector(LOCAL, FIRST,
                CONNECTOR_FOR_UPDATE,
                FileUtils.getResourceAsString("create_connector_api_config.json"));
        pages.openConnectorsList(LOCAL)
                .isOnPage()
                .openConnector(CONNECTOR_FOR_UPDATE);
        pages.openConnectorsView(LOCAL, CONNECTOR_FOR_UPDATE)
                .openEditConfig();
         Helpers.INSTANCE.apiHelper.deleteConnector(LOCAL, FIRST, CONNECTOR_FOR_UPDATE);
    }

    @SneakyThrows
    @DisplayName("should delete connector")
    @Test
    void deleteConnector() {
        Helpers.INSTANCE.apiHelper.createConnector(LOCAL, FIRST,
                CONNECTOR_FOR_DELETE,
                FileUtils.getResourceAsString("create_connector_api_config.json"));
        pages.openConnectorsList(LOCAL)
                .isOnPage()
                .openConnector(CONNECTOR_FOR_DELETE);
        pages.openConnectorsView(LOCAL, CONNECTOR_FOR_DELETE)
                .clickDeleteButton();
        pages.openConnectorsList(LOCAL).isNotVisible(CONNECTOR_FOR_DELETE);
    }
}
