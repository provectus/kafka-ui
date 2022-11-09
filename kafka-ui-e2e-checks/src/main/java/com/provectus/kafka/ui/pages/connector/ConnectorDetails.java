package com.provectus.kafka.ui.pages.connector;

import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;

public class ConnectorDetails extends BasePage {

  protected SelenideElement deleteBtn = $x("//li/div[contains(text(),'Delete')]");
  protected SelenideElement confirmBtnMdl = $x("//div[@role='dialog']//button[contains(text(),'Confirm')]");
  protected SelenideElement contentTextArea = $x("//textarea[@class='ace_text-input']");
  protected SelenideElement taskTab = $x("//a[contains(text(),'Tasks')]");
  protected SelenideElement configTab = $x("//a[contains(text(),'Config')]");
  protected SelenideElement configField = $x("//div[@id='config']");
  protected String connectorHeaderLocator = "//h1[contains(text(),'%s')]";

  @Step
  public ConnectorDetails waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
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
      clickSubmitBtn();
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

    @Step
    public boolean isAlertWithMessageVisible(AlertHeader header, String message){
      return isAlertVisible(header, message);
    }
}
