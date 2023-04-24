package com.provectus.kafka.ui;

import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.BROKERS;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.CONSUMERS;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.KAFKA_CONNECT;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.KSQL_DB;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.SCHEMA_REGISTRY;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.TOPICS;
import static com.provectus.kafka.ui.settings.BaseSource.BASE_UI_URL;
import static com.provectus.kafka.ui.settings.drivers.WebDriver.browserClear;
import static com.provectus.kafka.ui.settings.drivers.WebDriver.browserQuit;
import static com.provectus.kafka.ui.settings.drivers.WebDriver.browserSetup;
import static com.provectus.kafka.ui.settings.drivers.WebDriver.loggerSetup;
import static com.provectus.kafka.ui.utilities.qase.QaseSetup.qaseIntegrationSetup;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.settings.listeners.AllureListener;
import com.provectus.kafka.ui.settings.listeners.LoggerListener;
import com.provectus.kafka.ui.settings.listeners.QaseResultListener;
import io.qameta.allure.Step;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Listeners;
import org.testng.asserts.SoftAssert;

@Slf4j
@Listeners({AllureListener.class, LoggerListener.class, QaseResultListener.class})
public abstract class BaseTest extends Facade {

  @BeforeSuite(alwaysRun = true)
  public void beforeSuite() {
    qaseIntegrationSetup();
    loggerSetup();
    browserSetup();
  }

  @AfterSuite(alwaysRun = true)
  public void afterSuite() {
    browserQuit();
  }

  @BeforeMethod(alwaysRun = true)
  public void beforeMethod() {
    Selenide.open(BASE_UI_URL);
    naviSideBar.waitUntilScreenReady();
  }

  @AfterMethod(alwaysRun = true)
  public void afterMethod() {
    browserClear();
  }

  @Step
  protected void navigateToBrokers() {
    naviSideBar
        .openSideMenu(BROKERS);
    brokersList
        .waitUntilScreenReady();
  }

  @Step
  protected void navigateToBrokersAndOpenDetails(int brokerId) {
    naviSideBar
        .openSideMenu(BROKERS);
    brokersList
        .waitUntilScreenReady()
        .openBroker(brokerId);
    brokersDetails
        .waitUntilScreenReady();
  }

  @Step
  protected void navigateToTopics() {
    naviSideBar
        .openSideMenu(TOPICS);
    topicsList
        .waitUntilScreenReady()
        .setShowInternalRadioButton(false);
  }

  @Step
  protected void navigateToTopicsAndOpenDetails(String topicName) {
    navigateToTopics();
    topicsList
        .openTopic(topicName);
    topicDetails
        .waitUntilScreenReady();
  }

  @Step
  protected void navigateToConsumers() {
    naviSideBar
        .openSideMenu(CONSUMERS);
    consumersList
        .waitUntilScreenReady();
  }

  @Step
  protected void navigateToSchemaRegistry() {
    naviSideBar
        .openSideMenu(SCHEMA_REGISTRY);
    schemaRegistryList
        .waitUntilScreenReady();
  }

  @Step
  protected void navigateToSchemaRegistryAndOpenDetails(String schemaName) {
    navigateToSchemaRegistry();
    schemaRegistryList
        .openSchema(schemaName);
    schemaDetails
        .waitUntilScreenReady();
  }

  @Step
  protected void navigateToConnectors() {
    naviSideBar
        .openSideMenu(KAFKA_CONNECT);
    kafkaConnectList
        .waitUntilScreenReady();
  }

  @Step
  protected void navigateToConnectorsAndOpenDetails(String connectorName) {
    navigateToConnectors();
    kafkaConnectList
        .openConnector(connectorName);
    connectorDetails
        .waitUntilScreenReady();
  }

  @Step
  protected void navigateToKsqlDb() {
    naviSideBar
        .openSideMenu(KSQL_DB);
    ksqlDbList
        .waitUntilScreenReady();
  }

  @Step
  protected void verifyElementsCondition(List<SelenideElement> elementList, Condition expectedCondition) {
    SoftAssert softly = new SoftAssert();
    elementList.forEach(element -> softly.assertTrue(element.is(expectedCondition),
        element.getSearchCriteria() + " is " + expectedCondition));
    softly.assertAll();
  }
}
