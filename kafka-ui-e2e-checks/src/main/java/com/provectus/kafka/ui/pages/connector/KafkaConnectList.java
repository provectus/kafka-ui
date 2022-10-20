package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;

@ExtensionMethod(WaitUtils.class)
public class KafkaConnectList {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement pageTitle = $x("//h1[text()='Connectors']");
    protected SelenideElement createConnectorBtn = $x("//button[contains(text(),'Create Connector')]");
    protected SelenideElement connectorsGrid = $x("//table");
    protected String tabElementLocator = "//td[contains(text(),'%s')]";

    @Step
    public KafkaConnectList waitUntilScreenReady() {
        loadingSpinner.shouldBe(Condition.disappear);
        pageTitle.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public KafkaConnectList clickCreateConnectorBtn() {
        clickByJavaScript(createConnectorBtn);
        return this;
    }

    @Step
    public KafkaConnectList openConnector(String connectorName) {
        $x(String.format(tabElementLocator,connectorName)).shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public boolean isConnectorVisible(String connectorName) {
        connectorsGrid.shouldBe(Condition.visible);
        return isVisible($x(String.format(tabElementLocator,connectorName)));
    }

    @Step
    public KafkaConnectList connectorIsUpdatedInList(String connectorName, String topicName) {
        $x(String.format(tabElementLocator,connectorName)).shouldBe(Condition.visible);
        By.xpath(String.format(tabElementLocator,topicName)).refreshUntil(Condition.visible);
        return this;
    }
}
