package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.helpers.TestConfiguration;
import com.provectus.kafka.ui.utils.BrowserUtils;
import com.provectus.kafka.ui.extensions.WaitUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;

@ExtensionMethod(WaitUtils.class)
public class ConnectorsList {

    private static final String path = "/ui/clusters/%s/connectors";

    @Step("Open URL to {cluster}")
    public ConnectorsList goTo(String cluster) {
        Selenide.open(TestConfiguration.BASE_WEB_URL + String.format(path, cluster));
        return this;
    }

    @Step
    public ConnectorsList isOnPage() {
        $(By.xpath("//h1[text()='Connectors']")).shouldBe(Condition.visible);
        return this;
    }

    @Step("Click on button 'Create Connector'")
    public ConnectorCreateView clickCreateConnectorButton() {
        BrowserUtils.javaExecutorClick($x("//button[text()='Create Connector']"));
        return new ConnectorCreateView();
    }

    @SneakyThrows
    public ConnectorsList openConnector(String connectorName) {
        $(By.linkText(connectorName)).click();
        return this;
    }

    @SneakyThrows
    public ConnectorsList isNotVisible(String connectorName) {
        $(By.xpath("//table")).shouldBe(Condition.visible);
        $x("//tbody//td[1]//a[text()='" + connectorName + "']").shouldBe(Condition.not(Condition.visible));
        return this;
    }

    @Step("Verify that connector {connectorName} is visible in the list")
    public ConnectorsList connectorIsVisibleInList(String connectorName, String topicName) {
        $x("//table//a[@href='/ui/clusters/local/connects/first/connectors/" + connectorName +"']").shouldBe(Condition.visible);
       $$(By.linkText(topicName));
        return this;
    }

    public ConnectorsList connectorIsUpdatedInList(String connectorName, String topicName) {
        $(By.xpath(String.format("//a[text() = '%s']", connectorName))).shouldBe(Condition.visible);
        By.xpath(String.format("//a[text() = '%s']", topicName)).refreshUntil(Condition.visible);
        return this;
    }
}
