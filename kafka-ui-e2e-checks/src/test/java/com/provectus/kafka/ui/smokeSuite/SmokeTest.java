package com.provectus.kafka.ui.smokeSuite;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.WebDriverRunner;
import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.enums.MenuItem;
import com.provectus.kafka.ui.models.Connector;
import com.provectus.kafka.ui.models.Schema;
import com.provectus.kafka.ui.models.Topic;
import io.qameta.allure.Step;
import io.qase.api.annotation.QaseId;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.provectus.kafka.ui.enums.MenuItem.*;
import static com.provectus.kafka.ui.settings.BaseSource.BROWSER;
import static com.provectus.kafka.ui.utilities.FileUtils.getResourceAsString;
import static com.provectus.kafka.ui.variables.Browser.LOCAL;
import static com.provectus.kafka.ui.variables.Url.*;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

public class SmokeTest extends BaseTest {

    private static final int BROKER_ID = 1;
    private static final Schema TEST_SCHEMA = Schema.createSchemaAvro();
    private static final Topic TEST_TOPIC = new Topic()
            .setName("new-topic-" + randomAlphabetic(5))
            .setNumberOfPartitions(1);
    private static final Connector TEST_CONNECTOR = new Connector()
            .setName("new-connector-" + randomAlphabetic(5))
            .setConfig(getResourceAsString("config_for_create_connector_via_api.json"));

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
    public void checkComponentsPathWhileNavigating() {
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
        String host = BROWSER.equals(LOCAL) ? "localhost" : "host.testcontainers.internal";
        Assert.assertEquals(WebDriverRunner.getWebDriver().getCurrentUrl(),
                String.format(expectedUrl, host), "getCurrentUrl()");
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
