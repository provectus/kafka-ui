package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.helpers.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

@ExtensionMethod(WaitUtils.class)
public class ConnectorsView {
    private static final String path = "/ui/clusters/%s/connects/first/connectors/%s";

    @Step
    public ConnectorsView goTo(String cluster, String connector) {
        Selenide.open(String.format(TestConfiguration.BASE_WEB_URL + path, cluster, connector));
        return this;
    }

    @Step()
    public ConnectorUpdateView openConfigTab() {
        BrowserUtils.javaExecutorClick($(By.xpath("//a[text() ='Config']")));
        return new ConnectorUpdateView();
    }

    @Step("Click 'Delete' button")
    public void clickDeleteButton() {
        BrowserUtils.javaExecutorClick($x("//button[text()='Delete']"));
        SelenideElement confirmButton = $x("//div[@role=\"dialog\"]//button[text()='Confirm']");
        confirmButton.shouldBe(Condition.enabled).click();
        confirmButton.shouldBe(Condition.disappear);
    }

    @Step
    public void connectorIsVisibleOnOverview() {
        $(By.xpath("//a[text() ='Tasks']")).shouldBe(Condition.visible);
        $(By.xpath("//a[text() ='Config']")).shouldBe(Condition.visible);
        $(By.xpath("//a[text() ='Overview']")).shouldBe(Condition.visible);
    }
}
