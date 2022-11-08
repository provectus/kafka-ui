package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;

import static com.codeborne.selenide.Selenide.$x;
import static com.codeborne.selenide.Selenide.refresh;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;

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

    @Step
    public ConnectorCreateForm setConnectorDetails(String connectName, String configJson) {
        nameField.shouldBe(Condition.enabled).setValue(connectName);
        configField.shouldBe(Condition.enabled).click();
        contentTextArea.setValue(configJson);
        nameField.shouldBe(Condition.enabled).click();
        return this;
    }

    @Step
    public ConnectorCreateForm clickSubmitButton() {
      clickByJavaScript(submitBtn);
      loadingSpinner.shouldBe(Condition.disappear);
      return this;
    }
}
