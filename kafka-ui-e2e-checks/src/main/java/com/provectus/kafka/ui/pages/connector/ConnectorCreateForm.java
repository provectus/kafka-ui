package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;

import static com.codeborne.selenide.Selenide.$x;
import static com.codeborne.selenide.Selenide.sleep;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.screenshots.Screenshooter.log;

public class ConnectorCreateForm {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement nameField = $x("//input[@name='name']");
    protected SelenideElement contentTextArea = $x("//textarea[@class='ace_text-input']");
    protected SelenideElement submitBtn = $x("//button[@type='submit']");
    protected SelenideElement configField = $x("//div[@id='config']");

    @Step
    public ConnectorCreateForm waitUntilScreenReady() {
        loadingSpinner.shouldBe(Condition.disappear);
        nameField.shouldBe(Condition.visible);
        return this;
    }

    @Step("Set connector config JSON")
    public ConnectorCreateForm setConnectorConfig(String connectName, String configJson) {
        nameField.shouldBe(Condition.enabled).setValue(connectName);
        configField.shouldBe(Condition.visible).click();
        contentTextArea.setValue("");
        contentTextArea.setValue(String.valueOf(configJson.toCharArray()));
        nameField.shouldBe(Condition.visible).click();
        clickByJavaScript(submitBtn);
        sleep(4000);
        log.info("Connector config is submitted");
        return this;
    }
}