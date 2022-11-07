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
    protected SelenideElement createConnectorBtn = $x("//button[contains(text(),'Create Connector')]");
    protected SelenideElement connectorsGrid = $x("//table");
    protected String connectorNameLocator = "//td[contains(text(),'%s')]";

    @Step
    public KafkaConnectList waitUntilScreenReady() {
      loadingSpinner.shouldBe(Condition.disappear);
      createConnectorBtn.shouldBe(Condition.visible);
      return this;
    }

    @Step
    public KafkaConnectList clickCreateConnectorBtn() {
        clickByJavaScript(createConnectorBtn);
        return this;
    }

    @Step
    public KafkaConnectList openConnector(String connectorName) {
        $x(String.format(connectorNameLocator, connectorName))
                .shouldBe(Condition.enabled).click();
        return this;
    }

    @Step
    public boolean isConnectorVisible(String connectorName) {
        connectorsGrid.shouldBe(Condition.visible);
        return isVisible($x(String.format(connectorNameLocator,connectorName)));
    }

    @Step
    public KafkaConnectList connectorIsUpdatedInList(String connectorName, String topicName) {
        $x(String.format(connectorNameLocator,connectorName)).shouldBe(Condition.visible);
        By.xpath(String.format(connectorNameLocator,topicName)).refreshUntil(Condition.visible);
        return this;
    }
}
