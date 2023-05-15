package com.provectus.kafka.ui.pages.ksqldb;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;
import static com.codeborne.selenide.Selenide.sleep;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

public class KsqlQueryForm extends BasePage {
  protected SelenideElement clearBtn = $x("//div/button[text()='Clear']");
  protected SelenideElement executeBtn = $x("//div/button[text()='Execute']");
  protected SelenideElement clearResultsBtn = $x("//div/button[text()='Clear results']");
  protected SelenideElement addStreamPropertyBtn = $x("//button[text()='Add Stream Property']");
  protected SelenideElement queryAreaValue = $x("//div[@class='ace_content']");
  protected SelenideElement queryArea = $x("//div[@id='ksql']/textarea[@class='ace_text-input']");
  protected SelenideElement abortButton = $x("//div[@role='status']/div[text()='Abort']");
  protected SelenideElement cancelledAlert = $x("//div[@role='status'][text()='Cancelled']");
  protected ElementsCollection ksqlGridItems = $$x("//tbody//tr");
  protected ElementsCollection keyField = $$x("//input[@aria-label='key']");
  protected ElementsCollection valueField = $$x("//input[@aria-label='value']");

  @Step
  public KsqlQueryForm waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    executeBtn.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public KsqlQueryForm clickClearBtn() {
    clickByJavaScript(clearBtn);
    sleep(500);
    return this;
  }

  @Step
  public String getEnteredQuery() {
    return queryAreaValue.getText().trim();
  }

  @Step
  public KsqlQueryForm clickExecuteBtn(String query) {
    clickByActions(executeBtn);
    if (query.contains("EMIT CHANGES")) {
      abortButton.shouldBe(Condition.visible);
    } else {
      waitUntilSpinnerDisappear();
    }
    return this;
  }

  @Step
  public boolean isAbortBtnVisible() {
    return isVisible(abortButton);
  }

  @Step
  public KsqlQueryForm clickAbortBtn() {
    clickByActions(abortButton);
    return this;
  }

  @Step
  public boolean isCancelledAlertVisible() {
    return isVisible(cancelledAlert);
  }

  @Step
  public boolean isClearResultsBtnEnabled() {
    return isEnabled(clearResultsBtn);
  }

  @Step
  public KsqlQueryForm clickClearResultsBtn() {
    clickByActions(clearResultsBtn);
    waitUntilSpinnerDisappear();
    return this;
  }

  @Step
  public KsqlQueryForm clickAddStreamProperty() {
    clickByActions(addStreamPropertyBtn);
    return this;
  }

  @Step
  public KsqlQueryForm setQuery(String query) {
    queryAreaValue.shouldBe(Condition.visible).click();
    sendKeysByActions(queryArea, query);
    return this;
  }

  @Step
  public KsqlQueryForm.KsqlResponseGridItem getItemByName(String name) {
    return initItems().stream()
        .filter(e -> e.getName().equalsIgnoreCase(name))
        .findFirst().orElseThrow();
  }

  @Step
  public boolean areResultsVisible() {
    boolean visible = false;
    try {
      visible = initItems().size() > 0;
    } catch (Throwable ignored) {
    }
    return visible;
  }

  private List<KsqlQueryForm.KsqlResponseGridItem> initItems() {
    List<KsqlQueryForm.KsqlResponseGridItem> gridItemList = new ArrayList<>();
    ksqlGridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
        .forEach(item -> gridItemList.add(new KsqlQueryForm.KsqlResponseGridItem(item)));
    return gridItemList;
  }

  public static class KsqlResponseGridItem extends BasePage {

    private final SelenideElement element;

    private KsqlResponseGridItem(SelenideElement element) {
      this.element = element;
    }

    @Step
    public String getType() {
      return element.$x("./td[1]").getText().trim();
    }

    private SelenideElement getNameElm() {
      return element.$x("./td[2]");
    }

    @Step
    public String getName() {
      return getNameElm().scrollTo().getText().trim();
    }

    @Step
    public boolean isVisible() {
      boolean isVisible = false;
      try {
        getNameElm().shouldBe(visible, Duration.ofMillis(500));
        isVisible = true;
      } catch (Throwable ignored) {
      }
      return isVisible;
    }

    @Step
    public String getTopic() {
      return element.$x("./td[3]").getText().trim();
    }

    @Step
    public String getKeyFormat() {
      return element.$x("./td[4]").getText().trim();
    }

    @Step
    public String getValueFormat() {
      return element.$x("./td[5]").getText().trim();
    }

    @Step
    public String getIsWindowed() {
      return element.$x("./td[6]").getText().trim();
    }
  }
}
