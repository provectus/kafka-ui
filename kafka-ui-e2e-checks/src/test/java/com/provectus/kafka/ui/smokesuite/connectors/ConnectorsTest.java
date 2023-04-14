package com.provectus.kafka.ui.smokesuite.connectors;

import static com.provectus.kafka.ui.pages.BasePage.AlertHeader.SUCCESS;
import static com.provectus.kafka.ui.utilities.FileUtils.getResourceAsString;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.models.Connector;
import com.provectus.kafka.ui.models.Topic;
import io.qase.api.annotation.QaseId;
import java.util.ArrayList;
import java.util.List;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class ConnectorsTest extends BaseTest {

  private static final List<Topic> TOPIC_LIST = new ArrayList<>();
  private static final List<Connector> CONNECTOR_LIST = new ArrayList<>();
  private static final String MESSAGE_CONTENT = "testData/topics/message_content_create_topic.json";
  private static final String MESSAGE_KEY = " ";
  private static final Topic TOPIC_FOR_CREATE = new Topic()
      .setName("topic-for-create-connector-" + randomAlphabetic(5))
      .setMessageValue(MESSAGE_CONTENT).setMessageKey(MESSAGE_KEY);
  private static final Topic TOPIC_FOR_DELETE = new Topic()
      .setName("topic-for-delete-connector-" + randomAlphabetic(5))
      .setMessageValue(MESSAGE_CONTENT).setMessageKey(MESSAGE_KEY);
  private static final Topic TOPIC_FOR_UPDATE = new Topic()
      .setName("topic-for-update-connector-" + randomAlphabetic(5))
      .setMessageValue(MESSAGE_CONTENT).setMessageKey(MESSAGE_KEY);
  private static final Connector CONNECTOR_FOR_DELETE = new Connector()
      .setName("connector-for-delete-" + randomAlphabetic(5))
      .setConfig(getResourceAsString("testData/connectors/delete_connector_config.json"));
  private static final Connector CONNECTOR_FOR_UPDATE = new Connector()
      .setName("connector-for-update-and-delete-" + randomAlphabetic(5))
      .setConfig(getResourceAsString("testData/connectors/config_for_create_connector_via_api.json"));

  @BeforeClass(alwaysRun = true)
  public void beforeClass() {
    TOPIC_LIST.addAll(List.of(TOPIC_FOR_CREATE, TOPIC_FOR_DELETE, TOPIC_FOR_UPDATE));
    TOPIC_LIST.forEach(topic -> apiService
        .createTopic(topic)
        .sendMessage(topic)
    );
    CONNECTOR_LIST.addAll(List.of(CONNECTOR_FOR_DELETE, CONNECTOR_FOR_UPDATE));
    CONNECTOR_LIST.forEach(connector -> apiService.createConnector(connector));
  }

  @QaseId(42)
  @Test
  public void createConnector() {
    Connector connectorForCreate = new Connector()
        .setName("connector-for-create-" + randomAlphabetic(5))
        .setConfig(getResourceAsString("testData/connectors/config_for_create_connector.json"));
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
    Assert.assertTrue(connectorDetails.isConnectorHeaderVisible(connectorForCreate.getName()),
        "isConnectorTitleVisible()");
    navigateToConnectors();
    Assert.assertTrue(kafkaConnectList.isConnectorVisible(CONNECTOR_FOR_DELETE.getName()), "isConnectorVisible()");
    CONNECTOR_LIST.add(connectorForCreate);
  }

  @QaseId(196)
  @Test
  public void updateConnector() {
    navigateToConnectorsAndOpenDetails(CONNECTOR_FOR_UPDATE.getName());
    connectorDetails
        .openConfigTab()
        .setConfig(CONNECTOR_FOR_UPDATE.getConfig())
        .clickSubmitButton();
    Assert.assertTrue(connectorDetails.isAlertWithMessageVisible(SUCCESS, "Config successfully updated."),
        "isAlertWithMessageVisible()");
    navigateToConnectors();
    Assert.assertTrue(kafkaConnectList.isConnectorVisible(CONNECTOR_FOR_UPDATE.getName()), "isConnectorVisible()");
  }

  @QaseId(195)
  @Test
  public void deleteConnector() {
    navigateToConnectorsAndOpenDetails(CONNECTOR_FOR_DELETE.getName());
    connectorDetails
        .openDotMenu()
        .clickDeleteBtn()
        .clickConfirmBtn();
    navigateToConnectors();
    Assert.assertFalse(kafkaConnectList.isConnectorVisible(CONNECTOR_FOR_DELETE.getName()), "isConnectorVisible()");
    CONNECTOR_LIST.remove(CONNECTOR_FOR_DELETE);
  }

  @AfterClass(alwaysRun = true)
  public void afterClass() {
    CONNECTOR_LIST.forEach(connector ->
        apiService.deleteConnector(connector.getName()));
    TOPIC_LIST.forEach(topic -> apiService.deleteTopic(topic.getName()));
  }
}
