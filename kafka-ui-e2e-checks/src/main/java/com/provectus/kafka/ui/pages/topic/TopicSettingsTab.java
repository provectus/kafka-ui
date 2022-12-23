package com.provectus.kafka.ui.pages.topic;

import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.util.ArrayList;
import java.util.List;

public class TopicSettingsTab extends BasePage {

  protected SelenideElement defaultValueColumnHeaderLocator = $x("//div[text() = 'Default Value']");

  @Step
  public TopicSettingsTab waitUntilScreenReady(){
    waitUntilSpinnerDisappear();
    defaultValueColumnHeaderLocator.shouldBe(Condition.visible);
    return this;
  }

  private List<SettingsGridItem> initGridItems() {
    List<SettingsGridItem> gridItemList = new ArrayList<>();
    allGridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
        .forEach(item -> gridItemList.add(new SettingsGridItem(item)));
    return gridItemList;
  }

  private TopicSettingsTab.SettingsGridItem getItemByKey(String key){
    return initGridItems().stream()
        .filter(e ->e.getKey().equals(key))
        .findFirst().orElse(null);
  }

  @Step
  public String getValueByKey(String key){
    return getItemByKey(key).getValue();
  }

  public static class SettingsGridItem extends BasePage {

    private final SelenideElement element;

    public SettingsGridItem(SelenideElement element) {
      this.element = element;
    }

    @Step
    public String getKey(){
      return element.$x("./td[1]/span").getText().trim();
    }

    @Step
    public String getValue(){
      return element.$x("./td[2]/span").getText().trim();
    }

    @Step
    public String getDefaultValue() {
      return element.$x("./td[3]/span").getText().trim();
    }
  }
}
