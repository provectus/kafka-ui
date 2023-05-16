package com.provectus.kafka.ui.pages.connectors;

import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;

public class ConnectorCreateForm extends BasePage {

  protected SelenideElement nameField = $x("//input[@name='name']");
  protected SelenideElement contentTextArea = $x("//textarea[@class='ace_text-input']");
  protected SelenideElement configField = $x("//div[@id='config']");

  @Step
  public ConnectorCreateForm waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    nameField.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public ConnectorCreateForm setName(String connectName) {
    nameField.shouldBe(Condition.enabled).setValue(connectName);
    return this;
  }

  @Step
  public ConnectorCreateForm setConfig(String configJson) {
    configField.shouldBe(Condition.enabled).click();
    setJsonInputValue(contentTextArea, configJson);
    return this;
  }

  @Step
  public ConnectorCreateForm setConnectorDetails(String connectName, String configJson) {
    setName(connectName);
    setConfig(configJson);
    return this;
  }

  @Step
  public ConnectorCreateForm clickSubmitButton() {
    clickSubmitBtn();
    waitUntilSpinnerDisappear();
    return this;
  }
}
