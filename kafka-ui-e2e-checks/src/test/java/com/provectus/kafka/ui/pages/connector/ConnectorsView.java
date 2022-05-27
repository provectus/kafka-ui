package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import java.time.Duration;

import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selenide.$;

@ExtensionMethod(WaitUtils.class)
public class ConnectorsView {
    private static final String path = "/ui/clusters/%s/connects/first/connectors/%s";

    @Step
    public ConnectorsView goTo(String cluster, String connector) {
        Selenide.open(TestConfiguration.BASE_WEB_URL + path.formatted(cluster, connector));
        return this;
    }

    @Step
    public ConnectorUpdateView openEditConfig() {
        $(byLinkText("Edit Config")).click();
        return new ConnectorUpdateView();
    }

    @Step
    public void clickDeleteButton() {
        $(By.xpath("//span[text()='Delete']")).click();
        $(By.xpath("//button[text()='Submit']")).shouldBe(Condition.visible).click();
    }

    @Step
    public void connectorIsVisibleOnOverview() {
        $(By.xpath("//a[text() ='Tasks']")).click();
        $(By.xpath("//a[text() ='Config']")).click();
        $(By.xpath("//span[text()='Edit config']")).shouldBe(Condition.visible, Duration.ofMillis(300));
    }
}
