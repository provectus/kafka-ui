package com.provectus.kafka.ui.pages.topic;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class TopicsList extends BasePage {

    protected SelenideElement topicListHeader = $x("//h1[text()='Topics']");
    protected SelenideElement addTopicBtn = $x("//button[normalize-space(text()) ='Add a Topic']");
    protected SelenideElement searchField = $x("//input[@placeholder='Search by Topic Name']");
    protected SelenideElement showInternalRadioBtn = $x("//input[@name='ShowInternalTopics']");
    protected SelenideElement deleteSelectedTopicsBtn = $x("//button[text()='Delete selected topics']");
    protected SelenideElement copySelectedTopicBtn = $x("//button[text()='Copy selected topic']");
    protected SelenideElement purgeMessagesOfSelectedTopicsBtn = $x("//button[text()='Purge messages of selected topics']");
    protected SelenideElement clearMessagesBtn = $x("//ul[contains(@class ,'open')]//div[text()='Clear Messages']");
    protected SelenideElement recreateTopicBtn = $x("//ul[contains(@class ,'open')]//div[text()='Recreate Topic']");

    @Step
    public TopicsList waitUntilScreenReady() {
        waitUntilSpinnerDisappear();
        topicListHeader.shouldBe(visible);
        return this;
    }

    @Step
    public TopicsList clickAddTopicBtn() {
        clickByJavaScript(addTopicBtn);
        return this;
    }

    @Step
    public boolean isTopicVisible(String topicName) {
        tableGrid.shouldBe(visible);
        return isVisible(getTableElement(topicName));
    }

    @Step
    public boolean isShowInternalRadioBtnSelected() {
      return isSelected(showInternalRadioBtn);
    }

    @Step
    public TopicsList setShowInternalRadioButton(boolean select) {
      selectElement(showInternalRadioBtn, select);
      return this;
    }

    @Step
    public TopicsList openTopic(String topicName) {
        getTopicItem(topicName).openItem();
        return this;
    }

    @Step
    public TopicsList openDotMenuByTopicName(String topicName){
      getTopicItem(topicName).openDotMenu();
      return this;
    }

    @Step
    public boolean isCopySelectedTopicBtnEnabled(){
      return isEnabled(copySelectedTopicBtn);
    }

    @Step
    public List<SelenideElement> getActionButtons() {
      return Stream.of(deleteSelectedTopicsBtn, copySelectedTopicBtn, purgeMessagesOfSelectedTopicsBtn)
          .collect(Collectors.toList());
    }

    @Step
    public TopicsList clickCopySelectedTopicBtn(){
      copySelectedTopicBtn.shouldBe(Condition.enabled).click();
      return this;
    }

    @Step
    public TopicsList clickClearMessagesBtn(){
      clickByJavaScript(clearMessagesBtn.shouldBe(visible));
      return this;
    }

    @Step
    public TopicsList clickRecreateTopicBtn(){
      clickByJavaScript(recreateTopicBtn.shouldBe(visible));
      return this;
    }

    @Step
    public TopicsList clickConfirmBtnMdl() {
    clickConfirmButton();
    return this;
    }

    @Step
    public boolean isAlertWithMessageVisible(AlertHeader header, String message) {
      return isAlertVisible(header, message);
    }

    private List<SelenideElement> getVisibleColumnHeaders() {
      return Stream.of("Replication Factor","Number of messages","Topic Name", "Partitions", "Out of sync replicas", "Size")
          .map(name -> $x(String.format(columnHeaderLocator, name)))
        .collect(Collectors.toList());
    }

    private List<SelenideElement> getEnabledColumnHeaders(){
      return Stream.of("Topic Name", "Partitions", "Out of sync replicas", "Size")
          .map(name -> $x(String.format(columnHeaderLocator, name)))
          .collect(Collectors.toList());
    }

    @Step
    public List<SelenideElement> getAllVisibleElements() {
      List<SelenideElement> visibleElements = new ArrayList<>(getVisibleColumnHeaders());
      visibleElements.addAll(Arrays.asList(searchField, addTopicBtn, tableGrid));
      visibleElements.addAll(getActionButtons());
      return visibleElements;
    }

    @Step
    public List<SelenideElement> getAllEnabledElements() {
      List<SelenideElement> enabledElements = new ArrayList<>(getEnabledColumnHeaders());
      enabledElements.addAll(Arrays.asList(searchField, showInternalRadioBtn,addTopicBtn));
      return enabledElements;
    }

    private List<TopicGridItem> initGridItems() {
      List<TopicGridItem> gridItemList = new ArrayList<>();
      allGridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
          .forEach(item -> gridItemList.add(new TopicGridItem(item)));
      return gridItemList;
    }

    @Step
    public TopicGridItem getTopicItem(String name) {
      return initGridItems().stream()
        .filter(e -> e.getName().equals(name))
        .findFirst().orElse(null);
    }

    @Step
    public List<TopicGridItem> getNonInternalTopics() {
      return initGridItems().stream()
          .filter(e -> !e.isInternal())
          .collect(Collectors.toList());
    }

    @Step
    public List<TopicGridItem> getInternalTopics() {
      return initGridItems().stream()
          .filter(TopicGridItem::isInternal)
          .collect(Collectors.toList());
    }

    public static class TopicGridItem extends BasePage {

      private final SelenideElement element;

      public TopicGridItem(SelenideElement element) {
        this.element = element;
      }

      @Step
      public TopicsList selectItem(boolean select) {
         selectElement(element.$x("./td[1]/input"), select);
         return new TopicsList();
      }

      @Step
      public boolean isInternal() {
        boolean internal = false;
        try {
          element.$x("./td[2]/a/span").shouldBe(visible, Duration.ofMillis(500));
          internal = true;
        } catch (Throwable ignored) {
        }
        return internal;
      }

      private SelenideElement getNameElm() {
        return element.$x("./td[2]");
      }

      @Step
      public String getName() {
        return getNameElm().getText().trim();
      }

      @Step
      public void openItem() {
        getNameElm().click();
      }

      @Step
      public int getPartition() {
        return Integer.parseInt(element.$x("./td[3]").getText().trim());
      }

      @Step
      public int getOutOfSyncReplicas() {
        return Integer.parseInt(element.$x("./td[4]").getText().trim());
      }

      @Step
      public int getReplicationFactor() {
        return Integer.parseInt(element.$x("./td[5]").getText().trim());
      }

      @Step
      public int getNumberOfMessages() {
        return Integer.parseInt(element.$x("./td[6]").getText().trim());
      }

      @Step
      public int getSize() {
        return Integer.parseInt(element.$x("./td[7]").getText().trim());
      }

      @Step
      public void openDotMenu(){
        element.$x("./td[8]//button").click();
      }
    }
}
