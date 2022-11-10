package com.provectus.kafka.ui.pages.brokers;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;

import static com.codeborne.selenide.Selenide.$x;

@ExtensionMethod(WaitUtils.class)
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
