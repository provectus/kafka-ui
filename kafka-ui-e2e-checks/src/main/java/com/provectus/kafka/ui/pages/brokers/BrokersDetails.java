package com.provectus.kafka.ui.pages.brokers;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.openqa.selenium.By;

public class BrokersDetails extends BasePage {

  protected SelenideElement logDirectoriesTab = $x("//a[text()='Log directories']");
  protected SelenideElement metricsTab = $x("//a[text()='Metrics']");
  protected String brokersTabLocator = "//a[text()='%s']";

  @Step
  public BrokersDetails waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    Arrays.asList(logDirectoriesTab, metricsTab).forEach(element -> element.shouldBe(Condition.visible));
    return this;
  }

  @Step
  public BrokersDetails openDetailsTab(DetailsTab menu) {
    $(By.linkText(menu.toString())).shouldBe(Condition.enabled).click();
    waitUntilSpinnerDisappear();
    return this;
  }

  private List<SelenideElement> getVisibleColumnHeaders() {
    return Stream.of("Name", "Topics", "Error", "Partitions")
        .map(name -> $x(String.format(columnHeaderLocator, name)))
        .collect(Collectors.toList());
  }

  private List<SelenideElement> getEnabledColumnHeaders() {
    return Stream.of("Name", "Error")
        .map(name -> $x(String.format(columnHeaderLocator, name)))
        .collect(Collectors.toList());
  }

  private List<SelenideElement> getVisibleSummaryCells() {
    return Stream.of("Segment Size", "Segment Count", "Port", "Host")
        .map(name -> $x(String.format(summaryCellLocator, name)))
        .collect(Collectors.toList());
  }

  private List<SelenideElement> getDetailsTabs() {
    return Stream.of(DetailsTab.values())
        .map(name -> $x(String.format(brokersTabLocator, name)))
        .collect(Collectors.toList());
  }

  @Step
  public List<SelenideElement> getAllEnabledElements() {
    List<SelenideElement> enabledElements = new ArrayList<>(getEnabledColumnHeaders());
    enabledElements.addAll(getDetailsTabs());
    return enabledElements;
  }

  @Step
  public List<SelenideElement> getAllVisibleElements() {
    List<SelenideElement> visibleElements = new ArrayList<>(getVisibleSummaryCells());
    visibleElements.addAll(getVisibleColumnHeaders());
    visibleElements.addAll(getDetailsTabs());
    return visibleElements;
  }

  public enum DetailsTab {
    LOG_DIRECTORIES("Log directories"),
    CONFIGS("Configs"),
    METRICS("Metrics");

    private final String value;

    DetailsTab(String value) {
      this.value = value;
    }

    public String toString() {
      return value;
    }
  }
}
