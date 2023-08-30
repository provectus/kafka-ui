package com.provectus.kafka.ui.pages.brokers;

import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class BrokersConfigTab extends BasePage {

  protected List<SelenideElement> editBtn = $$x("//button[@aria-label='editAction']");
  protected SelenideElement searchByKeyField = $x("//input[@placeholder='Search by Key or Value']");
  protected SelenideElement sourceInfoIcon = $x("//div[text()='Source']/..//div/div[@class]");
  protected SelenideElement sourceInfoTooltip = $x("//div[text()='Source']/..//div/div[@style]");
  protected ElementsCollection editBtns = $$x("//button[@aria-label='editAction']");

  @Step
  public BrokersConfigTab waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    searchFld.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public BrokersConfigTab hoverOnSourceInfoIcon() {
    sourceInfoIcon.shouldBe(Condition.visible).hover();
    return this;
  }

  @Step
  public String getSourceInfoTooltipText() {
    return sourceInfoTooltip.shouldBe(Condition.visible).getText().trim();
  }

  @Step
  public boolean isSearchByKeyVisible() {
    return isVisible(searchFld);
  }

  @Step
  public BrokersConfigTab searchConfig(String key) {
    searchItem(key);
    return this;
  }

  public List<SelenideElement> getColumnHeaders() {
    return Stream.of("Key", "Value", "Source")
        .map(name -> $x(String.format(columnHeaderLocator, name)))
        .collect(Collectors.toList());
  }

  public List<SelenideElement> getEditButtons() {
    return editBtns;
  }

  @Step
  public BrokersConfigTab clickNextButton() {
    clickNextBtn();
    waitUntilSpinnerDisappear(1);
    return this;
  }

  @Step
  public BrokersConfigTab clickPreviousButton() {
    clickPreviousBtn();
    waitUntilSpinnerDisappear(1);
    return this;
  }

  private List<BrokersConfigTab.BrokersConfigItem> initGridItems() {
    List<BrokersConfigTab.BrokersConfigItem> gridItemList = new ArrayList<>();
    gridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
        .forEach(item -> gridItemList.add(new BrokersConfigTab.BrokersConfigItem(item)));
    return gridItemList;
  }

  @Step
  public BrokersConfigTab.BrokersConfigItem getConfig(String key) {
    return initGridItems().stream()
        .filter(e -> e.getKey().equals(key))
        .findFirst().orElseThrow();
  }

  @Step
  public List<BrokersConfigTab.BrokersConfigItem> getAllConfigs() {
    return initGridItems();
  }

  public static class BrokersConfigItem extends BasePage {

    private final SelenideElement element;

    public BrokersConfigItem(SelenideElement element) {
      this.element = element;
    }

    @Step
    public String getKey() {
      return element.$x("./td[1]").getText().trim();
    }

    @Step
    public String getValue() {
      return element.$x("./td[2]//span").getText().trim();
    }

    @Step
    public BrokersConfigItem setValue(String value) {
      sendKeysAfterClear(getValueFld(), value);
      return this;
    }

    @Step
    public SelenideElement getValueFld() {
      return element.$x("./td[2]//input");
    }

    @Step
    public SelenideElement getSaveBtn() {
      return element.$x("./td[2]//button[@aria-label='confirmAction']");
    }

    @Step
    public SelenideElement getCancelBtn() {
      return element.$x("./td[2]//button[@aria-label='cancelAction']");
    }

    @Step
    public SelenideElement getEditBtn() {
      return element.$x("./td[2]//button[@aria-label='editAction']");
    }

    @Step
    public BrokersConfigItem clickSaveBtn() {
      getSaveBtn().shouldBe(Condition.enabled).click();
      return this;
    }

    @Step
    public BrokersConfigItem clickCancelBtn() {
      getCancelBtn().shouldBe(Condition.enabled).click();
      return this;
    }

    @Step
    public BrokersConfigItem clickEditBtn() {
      getEditBtn().shouldBe(Condition.enabled).click();
      return this;
    }

    @Step
    public String getSource() {
      return element.$x("./td[3]").getText().trim();
    }

    @Step
    public BrokersConfigItem clickConfirm() {
      clickConfirmButton();
      return this;
    }
  }
}
