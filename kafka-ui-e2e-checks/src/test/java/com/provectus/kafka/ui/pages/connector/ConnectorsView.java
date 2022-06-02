package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;
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
        Selenide.open(TestConfiguration.BASE_WEB_URL + path.format(cluster, connector));
        return this;
    }

    @Step("Open 'Edit Config' of connector")
    public ConnectorUpdateView openEditConfig() {
        BrowserUtils.javaExecutorClick($x("//button[@type='button']/span[.='Edit Config']"));
        return new ConnectorUpdateView();
    }

    @Step("Click 'Delete' button")
    public void clickDeleteButton() {
        BrowserUtils.javaExecutorClick($x("//span[text()='Delete']"));
        $(By.xpath("//button[text()='Submit']")).shouldBe(Condition.visible).click();
    }

    @Step
    public void connectorIsVisibleOnOverview() {
        $(By.xpath("//a[text() ='Tasks']")).shouldBe(Condition.visible);
        $(By.xpath("//a[text() ='Config']")).shouldBe(Condition.visible);
        $(By.xpath("//a[text() ='Overview']")).shouldBe(Condition.visible);
    }
}
