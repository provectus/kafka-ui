package com.provectus.kafka.ui.pages.brokers;

import static com.codeborne.selenide.Selenide.$x;

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
  public BrokersList openBroker(String brokerId) {
    getBrokerItem(brokerId).openItem();
    return this;
  }

  private List<SelenideElement> getVisibleUptimeSummaryCells() {
    return Stream.of("Broker Count", "Active Controllers", "Version")
        .map(name -> $x(String.format(summaryCellLocator, name)))
        .collect(Collectors.toList());
  }

  private List<SelenideElement> getVisiblePartitionsSummaryCells() {
    return Stream.of("Online", "URP", "In Sync Replicas", "Out Of Sync Replicas")
        .map(name -> $x(String.format(summaryCellLocator, name)))
        .collect(Collectors.toList());
  }

  @Step
  public List<SelenideElement> getAllVisibleElements() {
    List<SelenideElement> visibleElements = new ArrayList<>(getVisibleUptimeSummaryCells());
    visibleElements.addAll(getVisiblePartitionsSummaryCells());
    return visibleElements;
  }

  private List<BrokersList.BrokerGridItem> initGridItems() {
    List<BrokersList.BrokerGridItem> gridItemList = new ArrayList<>();
    allGridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
        .forEach(item -> gridItemList.add(new BrokersList.BrokerGridItem(item)));
    return gridItemList;
  }

  @Step
  public BrokerGridItem getBrokerItem(String id){
    return initGridItems().stream()
        .filter(e ->e.getBrokerId().equals(id))
        .findFirst().orElse(null);
  }


  public static class BrokerGridItem extends BasePage {

    private final SelenideElement element;

    public BrokerGridItem(SelenideElement element) {
      this.element = element;
    }

    private SelenideElement getIdElm() {
      return element.$x("./td[1]");
    }

    @Step
    public String getBrokerId() {
      return getIdElm().getText().trim();
    }

    @Step
    public void openItem() {
      getIdElm().click();
    }

    @Step
    public int getSegmentCount(){
      return Integer.parseInt(element.$x("./td[3]").getText().trim());
    }

    @Step
    public int getPort(){
      return Integer.parseInt(element.$x("./td[4]").getText().trim());
    }
  }
}
