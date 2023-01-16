package com.provectus.kafka.ui.suite.connectors;

import static com.provectus.kafka.ui.pages.BasePage.AlertHeader.SUCCESS;
import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.KAFKA_CONNECT;
import static com.provectus.kafka.ui.utilities.FileUtils.getResourceAsString;
import static org.apache.commons.lang.RandomStringUtils.randomAlphabetic;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.models.Connector;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qameta.allure.Step;
import io.qase.api.annotation.CaseId;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ConnectorsTests extends BaseTest {
    private static final long SUITE_ID = 10;
    private static final String SUITE_TITLE = "Kafka Connect";
    private static final String CONNECT_NAME = "first";
    private static final List<Topic> TOPIC_LIST = new ArrayList<>();
    private static final List<Connector> CONNECTOR_LIST = new ArrayList<>();
    private static final String MESSAGE_CONTENT = "message_content_create_topic.json";
    private static final String MESSAGE_KEY = " ";
    private static final Topic TOPIC_FOR_CREATE = new Topic()
            .setName("topic_for_create_connector-" + randomAlphabetic(5))
            .setMessageContent(MESSAGE_CONTENT).setMessageKey(MESSAGE_KEY);
    private static final Topic TOPIC_FOR_DELETE = new Topic()
            .setName("topic_for_delete_connector-" + randomAlphabetic(5))
            .setMessageContent(MESSAGE_CONTENT).setMessageKey(MESSAGE_KEY);
    private static final Topic TOPIC_FOR_UPDATE = new Topic()
            .setName("topic_for_update_connector-" + randomAlphabetic(5))
            .setMessageContent(MESSAGE_CONTENT).setMessageKey(MESSAGE_KEY);
    private static final Connector CONNECTOR_FOR_DELETE = new Connector()
            .setName("sink_postgres_activities_e2e_checks_for_delete-" + randomAlphabetic(5))
            .setConfig(getResourceAsString("delete_connector_config.json"));
    private static final Connector CONNECTOR_FOR_UPDATE = new Connector()
            .setName("sink_postgres_activities_e2e_checks_for_update-" + randomAlphabetic(5))
            .setConfig(getResourceAsString("config_for_create_connector_via_api.json"));

    @BeforeAll
    public void beforeAll() {
      TOPIC_LIST.addAll(List.of(TOPIC_FOR_CREATE, TOPIC_FOR_DELETE, TOPIC_FOR_UPDATE));
      TOPIC_LIST.forEach(topic -> apiService
          .createTopic(topic.getName())
          .sendMessage(topic)
      );
      CONNECTOR_LIST.addAll(List.of(CONNECTOR_FOR_DELETE, CONNECTOR_FOR_UPDATE));
      CONNECTOR_LIST.forEach(connector -> apiService
          .createConnector(CONNECT_NAME, connector));
    }

    @DisplayName("should create a connector")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(42)
    @Test
    public void createConnector() {
        Connector connectorForCreate = new Connector()
                .setName("sink_postgres_activities_e2e_checks-" + randomAlphabetic(5))
                .setConfig(getResourceAsString("config_for_create_connector.json"));
        navigateToConnectors();
      kafkaConnectList
                .clickCreateConnectorBtn();
        connectorCreateForm
                .waitUntilScreenReady()
                .setConnectorDetails(connectorForCreate.getName(), connectorForCreate.getConfig())
                .clickSubmitButton();
        connectorDetails
                .waitUntilScreenReady();
        navigateToConnectorsAndOpenDetails(connectorForCreate.getName());
        Assertions.assertTrue(connectorDetails.isConnectorHeaderVisible(connectorForCreate.getName()),"isConnectorTitleVisible()");
        navigateToConnectors();
        Assertions.assertTrue(kafkaConnectList.isConnectorVisible(CONNECTOR_FOR_DELETE.getName()), "isConnectorVisible()");
        CONNECTOR_LIST.add(connectorForCreate);
    }

    @DisplayName("should update a connector")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(196)
    @Test
    public void updateConnector() {
      navigateToConnectorsAndOpenDetails(CONNECTOR_FOR_UPDATE.getName());
      connectorDetails
                .openConfigTab()
                .setConfig(CONNECTOR_FOR_UPDATE.getConfig())
                .clickSubmitButton();
        Assertions.assertTrue(connectorDetails.isAlertWithMessageVisible(SUCCESS,"Config successfully updated."),"isAlertWithMessageVisible()");
        navigateToConnectors();
        Assertions.assertTrue(kafkaConnectList.isConnectorVisible(CONNECTOR_FOR_UPDATE.getName()), "isConnectorVisible()");
    }

    @DisplayName("should delete connector")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(195)
    @Test
    public void deleteConnector() {
      navigateToConnectorsAndOpenDetails(CONNECTOR_FOR_DELETE.getName());
      connectorDetails
                .openDotMenu()
                .clickDeleteBtn()
                .clickConfirmBtn();
      navigateToConnectors();
        Assertions.assertFalse(kafkaConnectList.isConnectorVisible(CONNECTOR_FOR_DELETE.getName()), "isConnectorVisible()");
        CONNECTOR_LIST.remove(CONNECTOR_FOR_DELETE);
    }

    @AfterAll
    public void afterAll() {
        CONNECTOR_LIST.forEach(connector ->
                apiService.deleteConnector(CONNECT_NAME, connector.getName()));
        TOPIC_LIST.forEach(topic -> apiService.deleteTopic(topic.getName()));
    }

    @Step
    private void navigateToConnectors(){
      naviSideBar
          .openSideMenu(KAFKA_CONNECT);
      kafkaConnectList
          .waitUntilScreenReady();
    }

    @Step
    private void navigateToConnectorsAndOpenDetails(String connectorName){
      navigateToConnectors();
      kafkaConnectList
          .openConnector(connectorName);
      connectorDetails
          .waitUntilScreenReady();
    }
}
