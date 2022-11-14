package com.provectus.kafka.ui.pages.brokers;

import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;

public class BrokersList extends BasePage {

  protected SelenideElement brokersListHeader = $x("//h1[text()='Brokers']");

  @Step
  public BrokersList waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    brokersListHeader.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public boolean isBrokerVisible(String brokerId) {
    tableGrid.shouldBe(Condition.visible);
    return isVisible(getTableElement(brokerId));
  }

  @Step
  public BrokersList openBroker(String brokerName) {
    getTableElement(brokerName).shouldBe(Condition.enabled).click();
    return this;
  }
}
