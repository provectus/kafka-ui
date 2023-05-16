package com.provectus.kafka.ui.pages.consumers;

import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.CONSUMERS;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;

public class ConsumersList extends BasePage {

  @Step
  public ConsumersList waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    getPageTitleFromHeader(CONSUMERS).shouldBe(Condition.visible);
    return this;
  }
}
