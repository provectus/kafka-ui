package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.extensions.FileUtils;
import com.provectus.kafka.ui.helpers.Helpers;
import lombok.SneakyThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class ConnectorsTests extends BaseTest {

    public static final String LOCAL = "local";
    public static final String SOURCE_CONNECTOR = "source_postgres_activities";
    public static final String SINK_CONNECTOR = "sink_postgres_activities_e2e_checks";
    public static final String TOPIC_FOR_CONNECTOR = "topic_for_connector";
    public static final String FIRST = "first";

    @SneakyThrows
    @DisplayName("should create a connector")
    @Test
    void createConnector() {
        Helpers.INSTANCE.apiHelper.createTopic(LOCAL, TOPIC_FOR_CONNECTOR);
        pages.openConnectorsList(LOCAL)
                .isOnPage()
                .clickCreateConnectorButton()
                .setConnectorConfig(
                        SINK_CONNECTOR,
                        FileUtils.getResourceAsString("sink_activities.json")
                )
                .connectorIsVisible();
        Helpers.INSTANCE.apiHelper.deleteTopic(LOCAL,TOPIC_FOR_CONNECTOR);
        Helpers.INSTANCE.apiHelper.deleteConnector(LOCAL, FIRST, SINK_CONNECTOR);
    }
    //tbd
    @SneakyThrows
    @DisplayName("should update a connector")
    @Test
    void updateConnector() {
        pages.openConnectorsList(SECOND_LOCAL)
                .isOnPage()
                .openConnector(SOURCE_CONNECTOR);
        pages.openConnectorsView(SECOND_LOCAL, SOURCE_CONNECTOR)
                .openEditConfig();
    }

    @SneakyThrows
    @DisplayName("should delete connector")
    @Test
    void deleteConnector() {
        Helpers.INSTANCE.apiHelper.createTopic(LOCAL, TOPIC_FOR_CONNECTOR);
        Helpers.INSTANCE.apiHelper.createConnector(LOCAL, FIRST, SINK_CONNECTOR,
                FileUtils.getResourceAsString("create_connector_api_config.json"));
        pages.openConnectorsList(LOCAL)
                .isOnPage()
                .openConnector(SINK_CONNECTOR);
        pages.openConnectorsView(LOCAL, SINK_CONNECTOR)
                .clickDeleteButton();
        pages.openConnectorsList(LOCAL).isNotVisible(SINK_CONNECTOR);
        Helpers.INSTANCE.apiHelper.deleteTopic(LOCAL, TOPIC_FOR_CONNECTOR);
    }
}
