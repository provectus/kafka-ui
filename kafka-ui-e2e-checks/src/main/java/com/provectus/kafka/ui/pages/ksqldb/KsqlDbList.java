package com.provectus.kafka.ui.pages.ksqldb;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import com.provectus.kafka.ui.pages.ksqldb.enums.KsqlMenuTabs;
import io.qameta.allure.Step;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.openqa.selenium.By;

public class KsqlDbList extends BasePage {
  protected SelenideElement executeKsqlBtn = $x("//button[text()='Execute KSQL Request']");
  protected SelenideElement tablesTab = $x("//nav[@role='navigation']/a[text()='Tables']");
  protected SelenideElement streamsTab = $x("//nav[@role='navigation']/a[text()='Streams']");

  @Step
  public KsqlDbList waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    Arrays.asList(tablesTab, streamsTab).forEach(tab -> tab.shouldBe(Condition.visible));
    return this;
  }

  @Step
  public KsqlDbList clickExecuteKsqlRequestBtn() {
    clickByJavaScript(executeKsqlBtn);
    return this;
  }

  @Step
  public KsqlDbList openDetailsTab(KsqlMenuTabs menu) {
    $(By.linkText(menu.toString())).shouldBe(Condition.visible).click();
    waitUntilSpinnerDisappear();
    return this;
  }

  private List<KsqlDbList.KsqlTablesGridItem> initTablesItems() {
    List<KsqlDbList.KsqlTablesGridItem> gridItemList = new ArrayList<>();
    allGridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
        .forEach(item -> gridItemList.add(new KsqlDbList.KsqlTablesGridItem(item)));
    return gridItemList;
  }

  @Step
  public KsqlDbList.KsqlTablesGridItem getTableByName(String tableName) {
    return initTablesItems().stream()
        .filter(e -> e.getTableName().equals(tableName))
        .findFirst().orElse(null);
  }

  public static class KsqlTablesGridItem extends BasePage {

    private final SelenideElement element;

    public KsqlTablesGridItem(SelenideElement element) {
      this.element = element;
    }

    @Step
    public String getTableName() {
      return element.$x("./td[1]").getText().trim();
    }

    @Step
    public String getTopicName() {
      return element.$x("./td[2]").getText().trim();
    }

    @Step
    public String getKeyFormat() {
      return element.$x("./td[3]").getText().trim();
    }

    @Step
    public String getValueFormat() {
      return element.$x("./td[4]").getText().trim();
    }

    @Step
    public String getIsWindowed() {
      return element.$x("./td[5]").getText().trim();
    }
  }

  private List<KsqlDbList.KsqlStreamsGridItem> initStreamsItems() {
    List<KsqlDbList.KsqlStreamsGridItem> gridItemList = new ArrayList<>();
    allGridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
        .forEach(item -> gridItemList.add(new KsqlDbList.KsqlStreamsGridItem(item)));
    return gridItemList;
  }

  @Step
  public KsqlDbList.KsqlStreamsGridItem getStreamByName(String streamName) {
    return initStreamsItems().stream()
        .filter(e -> e.getStreamName().equals(streamName))
        .findFirst().orElse(null);
  }

  public static class KsqlStreamsGridItem extends BasePage {

    private final SelenideElement element;

    public KsqlStreamsGridItem(SelenideElement element) {
      this.element = element;
    }

    @Step
    public String getStreamName() {
      return element.$x("./td[1]").getText().trim();
    }

    @Step
    public String getTopicName() {
      return element.$x("./td[2]").getText().trim();
    }

    @Step
    public String getKeyFormat() {
      return element.$x("./td[3]").getText().trim();
    }

    @Step
    public String getValueFormat() {
      return element.$x("./td[4]").getText().trim();
    }

    @Step
    public String getIsWindowed() {
      return element.$x("./td[5]").getText().trim();
    }
  }
}
