package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

@ExtensionMethod(WaitUtils.class)
public class ConnectorsList {

    private static final String path = "/ui/clusters/%s/connectors";

    @Step
    public ConnectorsList goTo(String cluster) {
        Selenide.open(TestConfiguration.BASE_WEB_URL + String.format(path, cluster));
        return this;
    }

    @Step
    public ConnectorsList isOnPage() {
        $(By.xpath("//h1[text()='Connectors']")).shouldBe(Condition.visible);
        return this;
    }

    @Step
    public ConnectorCreateView clickCreateConnectorButton() {
        $(By.xpath("//button[text()='Create Connector']")).click();
        return new ConnectorCreateView();
    }

    @SneakyThrows
    public ConnectorsList openConnector(String connectorName) {
        $(By.xpath("//*/tr/td[1]/a[text()='%s']".formatted(connectorName)))
                .click();
        return this;
    }

    @SneakyThrows
    public ConnectorsList isNotVisible(String connectorName) {
        $(By.xpath("//table")).shouldBe(Condition.visible);
        $x("//tbody//td[1]//a[text()='" + connectorName + "']").shouldBe(Condition.not(Condition.visible));
        return this;
    }

    @Step
    public ConnectorsList connectorIsVisibleInList(String connectorName, String topicName) {
        $x("//tbody//td[1]//a[text()='" + connectorName + "']").shouldBe(Condition.visible);
        $x("//tbody//td[5]//a[text()='" + topicName + "']").shouldBe(Condition.visible);
        return this;
    }

    public ConnectorsList connectorIsUpdatedInList(String connectorName, String topicName) {
        $(By.xpath("//a[text() = '%s']".formatted(connectorName))).shouldBe(Condition.visible);
        By.xpath("//a[text() = '%s']".formatted(topicName)).refreshUntil(Condition.visible);
        return this;
    }
}
