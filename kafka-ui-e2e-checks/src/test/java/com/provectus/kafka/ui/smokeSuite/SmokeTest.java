package com.provectus.kafka.ui.smokeSuite;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.WebDriverRunner;
import com.provectus.kafka.ui.BaseTest;
import io.qameta.allure.Step;
import io.qase.api.annotation.QaseId;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.provectus.kafka.ui.settings.BaseSource.BROWSER;
import static com.provectus.kafka.ui.variables.Browser.LOCAL;
import static com.provectus.kafka.ui.variables.Url.*;

public class SmokeTest extends BaseTest {

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

    @Step
    private void verifyCurrentUrl(String expectedUrl) {
        String host = BROWSER.equals(LOCAL) ? "localhost" : "host.testcontainers.internal";
        Assert.assertEquals(WebDriverRunner.getWebDriver().getCurrentUrl(),
                String.format(expectedUrl, host), "getCurrentUrl()");
    }
}
