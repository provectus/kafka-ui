package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.settings.Source;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;

@ExtensionMethod(WaitUtils.class)
public class KafkaConnectList {

    private static final String path = "/ui/clusters/%s/connectors";

    @Step("Open URL to {cluster}")
    public KafkaConnectList goTo(String cluster) {
        Selenide.open(Source.BASE_WEB_URL + String.format(path, cluster));
        return this;
    }

    @Step
    public KafkaConnectList waitUntilScreenReady() {
        $(By.xpath("//h1[text()='Connectors']")).shouldBe(Condition.visible);
        return this;
    }

    @Step("Click on button 'Create Connector'")
    public ConnectorCreateForm clickCreateConnectorButton() {
        clickByJavaScript($x("//button[text()='Create Connector']"));
        return new ConnectorCreateForm();
    }

    @Step
    public KafkaConnectList openConnector(String connectorName) {
        $x("//tbody//td[1][text()='" + connectorName + "']").shouldBe(Condition.enabled).click();
        return this;
    }

    @Step
    public boolean isConnectorVisible(String connectorName) {
        $(By.xpath("//table")).shouldBe(Condition.visible);
        return isVisible($x("//tbody//td[1][text()='" + connectorName + "']"));
    }

    @Step
    public KafkaConnectList connectorIsUpdatedInList(String connectorName, String topicName) {
        $(By.xpath(String.format("//a[text() = '%s']", connectorName))).shouldBe(Condition.visible);
        By.xpath(String.format("//a[text() = '%s']", topicName)).refreshUntil(Condition.visible);
        return this;
    }
}
