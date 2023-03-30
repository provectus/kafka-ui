package com.provectus.kafka.ui;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.settings.listeners.AllureListener;
import com.provectus.kafka.ui.settings.listeners.LoggerListener;
import com.provectus.kafka.ui.settings.listeners.QaseResultListener;
import io.qameta.allure.Step;
import lombok.extern.slf4j.Slf4j;
import org.testng.annotations.*;
import org.testng.asserts.SoftAssert;

import java.util.List;

import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.*;
import static com.provectus.kafka.ui.settings.BaseSource.BASE_UI_URL;
import static com.provectus.kafka.ui.settings.drivers.WebDriver.*;
import static com.provectus.kafka.ui.utilities.qaseUtils.QaseSetup.qaseIntegrationSetup;

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
                .waitUntilScreenReady();
    }

    @Step
    protected void navigateToTopicsAndOpenDetails(String topicName) {
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
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
