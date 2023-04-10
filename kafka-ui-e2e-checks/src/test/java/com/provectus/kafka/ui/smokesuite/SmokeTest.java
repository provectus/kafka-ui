package com.provectus.kafka.ui.smokesuite;

import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.BROKERS;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.KAFKA_CONNECT;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.SCHEMA_REGISTRY;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.TOPICS;
import static com.provectus.kafka.ui.settings.BaseSource.BASE_HOST;
import static com.provectus.kafka.ui.utilities.FileUtils.getResourceAsString;
import static com.provectus.kafka.ui.variables.Url.BROKERS_LIST_URL;
import static com.provectus.kafka.ui.variables.Url.CONSUMERS_LIST_URL;
import static com.provectus.kafka.ui.variables.Url.KAFKA_CONNECT_LIST_URL;
import static com.provectus.kafka.ui.variables.Url.KSQL_DB_LIST_URL;
import static com.provectus.kafka.ui.variables.Url.SCHEMA_REGISTRY_LIST_URL;
import static com.provectus.kafka.ui.variables.Url.TOPICS_LIST_URL;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.WebDriverRunner;
import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.models.Connector;
import com.provectus.kafka.ui.models.Schema;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.pages.panels.enums.MenuItem;
import io.qameta.allure.Step;
import io.qase.api.annotation.QaseId;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class SmokeTest extends BaseTest {

  private static final int BROKER_ID = 1;
  private static final Schema TEST_SCHEMA = Schema.createSchemaAvro();
  private static final Topic TEST_TOPIC = new Topic()
      .setName("new-topic-" + randomAlphabetic(5))
      .setNumberOfPartitions(1);
  private static final Connector TEST_CONNECTOR = new Connector()
      .setName("new-connector-" + randomAlphabetic(5))
      .setConfig(getResourceAsString("testData/connectors/config_for_create_connector_via_api.json"));

  @BeforeClass(alwaysRun = true)
  public void beforeClass() {
    apiService
        .createTopic(TEST_TOPIC)
        .createSchema(TEST_SCHEMA)
        .createConnector(TEST_CONNECTOR);
  }

  @QaseId(198)
  @Test
  public void checkBasePageElements() {
    verifyElementsCondition(
        Stream.concat(topPanel.getAllVisibleElements().stream(), naviSideBar.getAllMenuButtons().stream())
            .collect(Collectors.toList()), Condition.visible);
    verifyElementsCondition(
        Stream.concat(topPanel.getAllEnabledElements().stream(), naviSideBar.getAllMenuButtons().stream())
            .collect(Collectors.toList()), Condition.enabled);
  }

  @QaseId(45)
  @Test
  public void checkUrlWhileNavigating() {
    navigateToBrokers();
    verifyCurrentUrl(BROKERS_LIST_URL);
    navigateToTopics();
    verifyCurrentUrl(TOPICS_LIST_URL);
    navigateToConsumers();
    verifyCurrentUrl(CONSUMERS_LIST_URL);
    navigateToSchemaRegistry();
    verifyCurrentUrl(SCHEMA_REGISTRY_LIST_URL);
    navigateToConnectors();
    verifyCurrentUrl(KAFKA_CONNECT_LIST_URL);
    navigateToKsqlDb();
    verifyCurrentUrl(KSQL_DB_LIST_URL);
  }

  @QaseId(46)
  @Test
  public void checkPathWhileNavigating() {
    navigateToBrokersAndOpenDetails(BROKER_ID);
    verifyComponentsPath(BROKERS, String.format("Broker %d", BROKER_ID));
    navigateToTopicsAndOpenDetails(TEST_TOPIC.getName());
    verifyComponentsPath(TOPICS, TEST_TOPIC.getName());
    navigateToSchemaRegistryAndOpenDetails(TEST_SCHEMA.getName());
    verifyComponentsPath(SCHEMA_REGISTRY, TEST_SCHEMA.getName());
    navigateToConnectorsAndOpenDetails(TEST_CONNECTOR.getName());
    verifyComponentsPath(KAFKA_CONNECT, TEST_CONNECTOR.getName());
  }

  @Step
  private void verifyCurrentUrl(String expectedUrl) {
    String urlWithoutParameters = WebDriverRunner.getWebDriver().getCurrentUrl();
    if (urlWithoutParameters.contains("?")) {
      urlWithoutParameters = urlWithoutParameters.substring(0, urlWithoutParameters.indexOf("?"));
    }
    Assert.assertEquals(urlWithoutParameters, String.format(expectedUrl, BASE_HOST), "getCurrentUrl()");
  }

  @Step
  private void verifyComponentsPath(MenuItem menuItem, String expectedPath) {
    Assert.assertEquals(naviSideBar.getPagePath(menuItem), expectedPath,
        String.format("getPagePath() for %s", menuItem.getPageTitle().toUpperCase()));
  }

  @AfterClass(alwaysRun = true)
  public void afterClass() {
    apiService
        .deleteTopic(TEST_TOPIC.getName())
        .deleteSchema(TEST_SCHEMA.getName())
        .deleteConnector(TEST_CONNECTOR.getName());
  }
}
