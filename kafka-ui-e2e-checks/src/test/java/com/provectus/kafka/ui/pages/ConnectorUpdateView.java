package com.provectus.kafka.ui.pages;

import io.qameta.allure.Step;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Selenide.$;
import static org.openqa.selenium.Keys.*;

public class ConnectorUpdateView {
    @Step
    public ConnectorUpdateView updateConnectorConfig(String configJson) {
        $(".ace_text-input").sendKeys(COMMAND, "a");
        $(".ace_text-input").sendKeys(Keys.BACK_SPACE);
        $(".ace_text-input").sendKeys(String.valueOf(configJson.toCharArray()));
        $(".ace_text-input").sendKeys(Keys.BACK_SPACE);
        $(By.xpath("//input[@type='submit']")).click();
        return this;
    }
}
