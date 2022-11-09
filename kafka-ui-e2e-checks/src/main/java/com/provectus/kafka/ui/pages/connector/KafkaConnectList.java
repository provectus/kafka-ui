package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;

import static com.codeborne.selenide.Selenide.$x;


@ExtensionMethod(WaitUtils.class)
public class KafkaConnectList extends BasePage {

    protected SelenideElement pageTitle = $x("//h1[text()='Connectors']");
    protected SelenideElement createConnectorBtn = $x("//button[contains(text(),'Create Connector')]");
//    protected SelenideElement connectorsGrid = $x("//table");
//    protected String tabElementLocator = "//td[contains(text(),'%s')]";

    public KafkaConnectList(){
        tableElementNameLocator = "//tbody//td[contains(text(),'%s')]";
    }

    @Step
    public KafkaConnectList waitUntilScreenReady() {
      waitUntilSpinnerDisappear();
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
      getTableElement(connectorName).shouldBe(Condition.enabled).click();
        return this;
    }

    @Step
    public boolean isConnectorVisible(String connectorName) {
        tableGrid.shouldBe(Condition.visible);
        return isVisible(getTableElement(connectorName));
    }
}
