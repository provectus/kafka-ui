package com.provectus.kafka.ui.smokeSuite;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.WebDriverRunner;
import com.provectus.kafka.ui.BaseTest;
import io.qameta.allure.Step;
import io.qase.api.annotation.QaseId;
import org.junit.Assert;
import org.testng.annotations.Test;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.provectus.kafka.ui.settings.BaseSource.BROWSER;
import static com.provectus.kafka.ui.variables.Browser.LOCAL;

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
    public void checkCurrentUrl() {
        navigateToBrokers();
        navigateToTopics();
        navigateToConsumers();
        navigateToSchemaRegistry();
        navigateToConnectors();
        navigateToKsqlDb();
    }
    
    @Step
    protected void verifyCurrentUrl(String expectedUrl) {
        if (BROWSER.equals(LOCAL))
            expectedUrl = expectedUrl.replace("http://host.testcontainers.internal","localhost");
        Assert.assertEquals(WebDriverRunner.getWebDriver().getCurrentUrl(),expectedUrl, "");
    }
}
