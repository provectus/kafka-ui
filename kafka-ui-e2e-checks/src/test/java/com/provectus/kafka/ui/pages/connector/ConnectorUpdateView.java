package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.executeAsyncJavaScript;
import static com.codeborne.selenide.Selenide.executeJavaScript;
import static com.codeborne.selenide.Selenide.sleep;
import static org.openqa.selenium.Keys.*;

public class ConnectorUpdateView {
    SelenideElement submitButton = $(By.xpath("//button[@type='submit']"));


    @Step
    public ConnectorUpdateView updateConnectorConfig(String configJson) {
        $("#config").click();
        String str = configJson.replace("\r\n", "");
        executeJavaScript(
                "function clearAndNot(){" +
                        "var editor = ace.edit('config');" +
                        "editor.setValue(\"\");" +
                        "editor.setValue('" + str + "');}" +
                        "clearAndNot();");
        $("#config").click();
        submitButton.click();
        $(byLinkText("Edit Config")).shouldBe(Condition.visible);
        sleep(3000);
        return this;


    }
}
