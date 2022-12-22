package com.provectus.kafka.ui.pages.brokers;

import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class BrokersConfigTab extends BasePage {

  protected List<SelenideElement> editBtn = $$x("//button[@aria-label='editAction']");
  protected SelenideElement searchByKeyField = $x("//input[@placeholder='Search by Key']");

  @Step
  public BrokersConfigTab waitUntilScreenReady(){
    waitUntilSpinnerDisappear();
    searchByKeyField.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public boolean isSearchByKeyVisible() {
   return isVisible(searchByKeyField);
  }

  public List<SelenideElement> getColumnHeaders() {
    return Stream.of("Key", "Value", "Source")
        .map(name -> $x(String.format(columnHeaderLocator, name)))
        .collect(Collectors.toList());
  }

  public List<SelenideElement> getEditButtons() {
    return editBtn;
  }
}
