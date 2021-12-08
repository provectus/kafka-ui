package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;

@ExtensionMethod(WaitUtils.class)
public class ConnectorsList {
    private static final String path = "ui/clusters/%s/connectors";

    @Step
    public ConnectorsList goTo(String cluster) {
        Selenide.open(TestConfiguration.BASE_URL+path.formatted(cluster));
        return this;
    }

    @Step
    public ConnectorsList isOnPage() {
        $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
        $(By.xpath("//span[text()='All Connectors']")).shouldBe(Condition.visible);
        return this;
    }

    @Step
    public ConnectorCreateView clickCreateConnectorButton() {
        $(By.xpath("//a[text()='Create Connector']")).click();
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
        By.xpath("//div[contains(@class,'section')]//table").refreshUntil(Condition.visible);
        $(By.xpath("//a[text()='%s']".formatted(connectorName))).shouldNotBe(Condition.visible);
        return this;
    }

    @Step
    public ConnectorsList connectorIsVisibleInList(String connectorName, String topicName) {
        By.xpath("//a[text() = '%s']".formatted(connectorName)).refreshUntil(Condition.visible);
        By.xpath("//a[text() = '%s']".formatted(topicName)).refreshUntil(Condition.visible);
        return this;
    }

    public ConnectorsList connectorIsUpdatedInList(String connectorName, String topicName) {
        $(By.xpath("//a[text() = '%s']".formatted(connectorName))).shouldBe(Condition.visible);
        By.xpath("//a[text() = '%s']".formatted(topicName)).refreshUntil(Condition.visible);
        return this;
    }
}
