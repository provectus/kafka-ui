package com.provectus.kafka.ui.pages.brokers;

import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.BROKERS;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class BrokersList extends BasePage {

  @Step
  public BrokersList waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    getPageTitleFromHeader(BROKERS).shouldBe(Condition.visible);
    return this;
  }

  @Step
  public BrokersList openBroker(int brokerId) {
    getBroker(brokerId).openItem();
    return this;
  }

  private List<SelenideElement> getUptimeSummaryCells() {
    return Stream.of("Broker Count", "Active Controller", "Version")
        .map(name -> $x(String.format(summaryCellLocator, name)))
        .collect(Collectors.toList());
  }

  private List<SelenideElement> getPartitionsSummaryCells() {
    return Stream.of("Online", "URP", "In Sync Replicas", "Out Of Sync Replicas")
        .map(name -> $x(String.format(summaryCellLocator, name)))
        .collect(Collectors.toList());
  }

  @Step
  public List<SelenideElement> getAllVisibleElements() {
    List<SelenideElement> visibleElements = new ArrayList<>(getUptimeSummaryCells());
    visibleElements.addAll(getPartitionsSummaryCells());
    return visibleElements;
  }

  private List<SelenideElement> getEnabledColumnHeaders() {
    return Stream.of("Broker ID", "Disk usage", "Partitions skew",
            "Leaders", "Leader skew", "Online partitions", "Port", "Host")
        .map(name -> $x(String.format(columnHeaderLocator, name)))
        .collect(Collectors.toList());
  }

  @Step
  public List<SelenideElement> getAllEnabledElements() {
    return getEnabledColumnHeaders();
  }

  private List<BrokersGridItem> initGridItems() {
    List<BrokersGridItem> gridItemList = new ArrayList<>();
    gridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
        .forEach(item -> gridItemList.add(new BrokersGridItem(item)));
    return gridItemList;
  }

  @Step
  public BrokersGridItem getBroker(int id) {
    return initGridItems().stream()
        .filter(e -> e.getId() == id)
        .findFirst().orElseThrow();
  }

  @Step
  public List<BrokersGridItem> getAllBrokers() {
    return initGridItems();
  }

  public static class BrokersGridItem extends BasePage {

    private final SelenideElement element;

    public BrokersGridItem(SelenideElement element) {
      this.element = element;
    }

    private SelenideElement getIdElm() {
      return element.$x("./td[1]/div/a");
    }

    @Step
    public int getId() {
      return Integer.parseInt(getIdElm().getText().trim());
    }

    @Step
    public void openItem() {
      getIdElm().click();
    }

    @Step
    public int getSegmentSize() {
      return Integer.parseInt(element.$x("./td[2]").getText().trim());
    }

    @Step
    public int getSegmentCount() {
      return Integer.parseInt(element.$x("./td[3]").getText().trim());
    }

    @Step
    public int getPort() {
      return Integer.parseInt(element.$x("./td[4]").getText().trim());
    }

    @Step
    public String getHost() {
      return element.$x("./td[5]").getText().trim();
    }
  }
}
