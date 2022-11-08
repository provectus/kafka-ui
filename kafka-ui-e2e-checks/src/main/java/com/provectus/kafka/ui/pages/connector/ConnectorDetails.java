package com.provectus.kafka.ui.pages.connector;

import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clearByKeyboard;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Arrays;

public class ConnectorDetails {

  protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
  protected SelenideElement dotMenuBtn = $x("//button[@aria-label='Dropdown Toggle']");
  protected SelenideElement deleteBtn = $x("//li/div[contains(text(),'Delete')]");
  protected SelenideElement confirmBtnMdl = $x("//div[@role='dialog']//button[contains(text(),'Confirm')]");
  protected SelenideElement submitBtn = $x("//button[@type='submit']");
  protected SelenideElement contentTextArea = $x("//textarea[@class='ace_text-input']");
  protected SelenideElement taskTab = $x("//a[contains(text(),'Tasks')]");
  protected SelenideElement configTab = $x("//a[contains(text(),'Config')]");
  protected SelenideElement configField = $x("//div[@id='config']");
  protected SelenideElement successAlertMessage = $x("//div[contains(text(),'Config successfully updated')]");
  protected String connectorHeaderLocator = "//h1[contains(text(),'%s')]";

  @Step
  public ConnectorDetails waitUntilScreenReady() {
    loadingSpinner.shouldBe(Condition.disappear);
    dotMenuBtn.shouldBe(Condition.visible);
    return this;
  }

    @Step
    public ConnectorDetails openConfigTab() {
        clickByJavaScript(configTab);
        return this;
    }

    @Step
    public ConnectorDetails setConfig(String configJson) {
        configField.shouldBe(Condition.enabled).click();
        clearByKeyboard(contentTextArea);
        contentTextArea.setValue(configJson);
        configField.shouldBe(Condition.enabled).click();
        return this;
    }

    @Step
    public ConnectorDetails clickSubmitButton() {
      clickByJavaScript(submitBtn);
      successAlertMessage.shouldBe(Condition.visible);
      return this;
    }

    @Step
    public ConnectorDetails openDotMenu() {
        clickByJavaScript(dotMenuBtn);
        return this;
    }

    @Step
    public ConnectorDetails clickDeleteBtn() {
        clickByJavaScript(deleteBtn);
        return this;
    }

    @Step
    public ConnectorDetails clickConfirmBtn() {
        confirmBtnMdl.shouldBe(Condition.enabled).click();
        confirmBtnMdl.shouldBe(Condition.disappear);
        return this;
    }

    @Step
    public ConnectorDetails deleteConnector() {
        openDotMenu();
        clickDeleteBtn();
        clickConfirmBtn();
        return this;
    }

    @Step
    public boolean isConnectorHeaderVisible(String connectorName) {
        return isVisible($x(String.format(connectorHeaderLocator,connectorName)));
    }
}
