package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selenide.*;
import static com.provectus.kafka.ui.screenshots.Screenshooter.log;

public class ConnectorUpdateView {
    SelenideElement submitButton = $(By.xpath("//button[@type='submit']"));
    SelenideElement contentTextArea = $("[wrap]");


    @Step("Update connector from new JSON")
    public ConnectorUpdateView updateConnectorConfig(String configJson) {
        BrowserUtils.javaExecutorClick($("#config"));
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

    @Step("Set connector config JSON")
    public ConnectorsView updConnectorConfig(String configJson) throws InterruptedException {
        contentTextArea.doubleClick();
        contentTextArea.setValue("");
        contentTextArea.setValue(String.valueOf(configJson.toCharArray()));
        $("#config").click();
        submitButton.shouldBe(Condition.enabled);
        BrowserUtils.javaExecutorClick(submitButton);
        sleep(4000);
        log.info("Connector config is submitted");
        return new ConnectorsView();
    }
}
