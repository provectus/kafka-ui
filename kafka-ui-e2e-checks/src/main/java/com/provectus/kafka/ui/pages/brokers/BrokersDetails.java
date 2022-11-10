package com.provectus.kafka.ui.pages.brokers;

import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import java.util.Arrays;

@ExtensionMethod(WaitUtils.class)
public class BrokersDetails extends BasePage {

    protected SelenideElement logDirectoriesTab = $x("//a[contains(text(),'Log directories')]");
    protected SelenideElement metricsTab = $x("//a[contains(text(),'Metrics')]");



  @Step
  public BrokersDetails waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    Arrays.asList(logDirectoriesTab,metricsTab).forEach(element -> element.shouldBe(Condition.visible));
    return this;
  }

}
