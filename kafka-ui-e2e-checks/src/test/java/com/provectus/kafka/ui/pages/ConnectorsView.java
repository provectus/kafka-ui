package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;

public class ConnectorsView {
    private static final String path = "ui/clusters/%s/connects/first/connectors/%s";

    @Step
    public ConnectorsView goTo(String cluster, String connector) {
        Selenide.open(TestConfiguration.BASE_URL + path.formatted(cluster, connector));
        return this;
    }

    @Step
    public ConnectorUpdateView openEditConfig() {
        $(By.xpath("//a/span[text()='Edit config']")).click();
        return new ConnectorUpdateView();
    }

    @Step
    public void clickDeleteButton() {
        $(By.xpath("//span[text()='Delete']")).click();
        $(By.xpath("//button[text()='Confirm']")).click();
    }
}
