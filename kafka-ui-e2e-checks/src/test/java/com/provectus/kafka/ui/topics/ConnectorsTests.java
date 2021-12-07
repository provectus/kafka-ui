package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.extensions.FileUtils;
import com.provectus.kafka.ui.helpers.ApiHelper;
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
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;

        String message = FileUtils.getResourceAsString("message_content_create_topic.json");
        String createConfig = FileUtils.getResourceAsString("config_for_create_connector_via_api.json");
        String deleteConfig = FileUtils.getResourceAsString("delete_connector_config.json");

        apiHelper.createTopic(LOCAL, TOPIC_FOR_CONNECTOR);
        apiHelper.sendMessage(LOCAL, TOPIC_FOR_CONNECTOR, message, " ");
     //   apiHelper.createTopic(LOCAL, TOPIC_FOR_UPDATE_CONNECTOR);
      //  apiHelper.sendMessage(LOCAL, TOPIC_FOR_UPDATE_CONNECTOR, message, " ");
        //apiHelper.createConnector(LOCAL, FIRST, CONNECTOR_FOR_UPDATE, createConfig);
      //  apiHelper.createTopic(LOCAL, TOPIC_FOR_DELETE_CONNECTOR);
    //    apiHelper.sendMessage(LOCAL, TOPIC_FOR_DELETE_CONNECTOR, message, " ");
    //    apiHelper.createConnector(LOCAL, FIRST, CONNECTOR_FOR_DELETE, deleteConfig);
    }

    @AfterAll
    @SneakyThrows
    public static void afterAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;

       apiHelper.deleteConnector(LOCAL, FIRST, SINK_CONNECTOR);
    //    apiHelper.deleteConnector(LOCAL, FIRST, CONNECTOR_FOR_UPDATE);
     //   apiHelper.deleteTopic(LOCAL, TOPIC_FOR_UPDATE_CONNECTOR);
       // apiHelper.deleteTopic(LOCAL, TOPIC_FOR_DELETE_CONNECTOR);
        apiHelper.deleteTopic(LOCAL, TOPIC_FOR_CONNECTOR);
    }

    @SneakyThrows
    @DisplayName("should create a connector")
    @Test
    void createConnector() {
        pages.openConnectorsList(LOCAL)
                .isOnPage()
                .clickCreateConnectorButton()
                .isOnConnectorCreatePage()
                .setConnectorConfig(
                        SINK_CONNECTOR,
                        FileUtils.getResourceAsString("config_for_create_connector.json")
                )
                .connectorIsVisibleOnOverview();
        pages.openConnectorsList(LOCAL).connectorIsVisibleInList(SINK_CONNECTOR, TOPIC_FOR_CONNECTOR);
    }

    //disable test due 500 error during create connector via api
    @SneakyThrows
    @DisplayName("should update a connector")
    @Test
    @Disabled
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
    @Disabled
    void deleteConnector() {
        pages.openConnectorsList(LOCAL)
                .isOnPage()
                .openConnector(CONNECTOR_FOR_DELETE);
        pages.openConnectorsView(LOCAL, CONNECTOR_FOR_DELETE)
                .clickDeleteButton();
        pages.openConnectorsList(LOCAL).isNotVisible(CONNECTOR_FOR_DELETE);
    }
}
