package com.provectus.kafka.ui.pages.topic;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;
import static org.apache.commons.lang.math.RandomUtils.nextInt;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import java.util.ArrayList;
import java.util.List;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

@ExtensionMethod({WaitUtils.class})
public class TopicDetails extends BasePage {

  protected SelenideElement clearMessagesBtn = $x(("//div[contains(text(), 'Clear messages')]"));
  protected SelenideElement messageAmountCell = $x("//tbody/tr/td[5]");
  protected SelenideElement overviewTab = $x("//a[contains(text(),'Overview')]");
  protected SelenideElement messagesTab = $x("//a[contains(text(),'Messages')]");
  protected SelenideElement editSettingsMenu = $x("//li[@role][contains(text(),'Edit settings')]");
  protected SelenideElement removeTopicBtn = $x("//ul[@role='menu']//div[contains(text(),'Remove Topic')]");
  protected SelenideElement confirmBtn = $x("//div[@role='dialog']//button[contains(text(),'Confirm')]");
  protected SelenideElement produceMessageBtn = $x("//div//button[text()='Produce Message']");
  protected SelenideElement contentMessageTab = $x("//html//div[@id='root']/div/main//table//p");
  protected SelenideElement cleanUpPolicyField = $x("//div[contains(text(),'Clean Up Policy')]/../span/*");
  protected SelenideElement partitionsField = $x("//div[contains(text(),'Partitions')]/../span");
  protected ElementsCollection messageGridItems = $$x("//tbody//tr");
  protected String consumerIdLocator = "//a[@title='%s']";
  protected String topicHeaderLocator = "//h1[contains(text(),'%s')]";

  @Step
  public TopicDetails waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    dotMenuBtn.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public TopicDetails openDetailsTab(TopicMenu menu) {
    $(By.linkText(menu.toString())).shouldBe(Condition.visible).click();
    waitUntilSpinnerDisappear();
    return this;
  }

  @Step
  public TopicDetails openDotMenu() {
    clickByJavaScript(dotMenuBtn);
    return this;
  }

  @Step
  public boolean isAlertWithMessageVisible(AlertHeader header, String message) {
    return isAlertVisible(header, message);
  }

  @Step
  public TopicDetails clickEditSettingsMenu() {
    editSettingsMenu.shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public TopicDetails clickClearMessagesMenu() {
    clearMessagesBtn.shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public String getCleanUpPolicy() {
    return cleanUpPolicyField.getText();
  }

  @Step
  public String getPartitions() {
    return partitionsField.getText();
  }

  @Step
  public boolean isTopicHeaderVisible(String topicName) {
    return isVisible($x(String.format(topicHeaderLocator, topicName)));
  }

  @Step
  public TopicDetails clickDeleteTopicMenu() {
    removeTopicBtn.shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public TopicDetails clickConfirmDeleteBtn() {
    confirmBtn.shouldBe(Condition.enabled).click();
    confirmBtn.shouldBe(Condition.disappear);
    return this;
  }

  @Step
  public TopicDetails clickProduceMessageBtn() {
    clickByJavaScript(produceMessageBtn);
    return this;
  }

  @Step
  public TopicDetails openConsumerGroup(String consumerId) {
    $x(String.format(consumerIdLocator, consumerId)).click();
    return this;
  }

  @Step
  public boolean isKeyMessageVisible(String keyMessage) {
    return keyMessage.equals($("td[title]").getText());
  }

  @Step
  public boolean isContentMessageVisible(String contentMessage) {
    return contentMessage.matches(contentMessageTab.getText().trim());
  }

  @Step
  public int getMessageCountAmount() {
    return Integer.parseInt(messageAmountCell.getText().trim());
  }

  private List<TopicDetails.MessageGridItem> initItems() {
    List<TopicDetails.MessageGridItem> gridItemList = new ArrayList<>();
    messageGridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
        .forEach(item -> gridItemList.add(new TopicDetails.MessageGridItem(item)));
    return gridItemList;
  }

  @Step
  public TopicDetails.MessageGridItem getMessage(int offset) {
    return initItems().stream()
        .filter(e -> e.getOffset() == offset)
        .findFirst().orElse(null);
  }

  @Step
  public TopicDetails.MessageGridItem getRandomMessage() {
    return getMessage(nextInt(initItems().size() - 1));
  }

  public static class MessageGridItem extends BasePage {

    private final SelenideElement element;

    private MessageGridItem(SelenideElement element) {
      this.element = element;
    }

    @Step
    public MessageGridItem clickExpand() {
      clickByJavaScript(element.$x("./td[1]/span"));
      return this;
    }

    private SelenideElement getOffsetElm() {
      return element.$x("./td[2]");
    }

    @Step
    public int getOffset() {
      return Integer.parseInt(getOffsetElm().getText().trim());
    }

    @Step
    public int getPartition() {
      return Integer.parseInt(element.$x("./td[3]").getText().trim());
    }

    @Step
    public String getTimestamp() {
      return element.$x("./td[4]/div").getText().trim();
    }

    @Step
    public String getKey() {
      return element.$x("./td[5]").getText().trim();
    }

    @Step
    public String getValue() {
      return element.$x("./td[6]/span/p").getText().trim();
    }

    @Step
    public MessageGridItem openDotMenu() {
      getOffsetElm().hover();
      element.$x("./td[7]/div/button[@aria-label='Dropdown Toggle']")
          .shouldBe(Condition.visible).click();
      return this;
    }

    @Step
    public MessageGridItem clickCopyToClipBoard() {
      clickByJavaScript(element.$x("./td[7]//li[text() = 'Copy to clipboard']")
          .shouldBe(Condition.visible));
      return this;
    }

    @Step
    public MessageGridItem clickSaveAsFile() {
      clickByJavaScript(element.$x("./td[7]//li[text() = 'Save as a file']")
          .shouldBe(Condition.visible));
      return this;
    }
  }

  public enum TopicMenu {
    OVERVIEW("Overview"),
    MESSAGES("Messages"),
    CONSUMERS("Consumers"),
    SETTINGS("Settings");

    private final String value;

    TopicMenu(String value) {
      this.value = value;
    }

    public String toString() {
      return value;
    }
  }
}
