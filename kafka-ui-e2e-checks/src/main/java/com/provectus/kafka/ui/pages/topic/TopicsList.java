package com.provectus.kafka.ui.pages.topic;

import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class TopicsList extends BasePage {

    protected SelenideElement topicListHeader = $x("//*[text()='Topics']");
    protected SelenideElement addTopicBtn = $x("//button[normalize-space(text()) ='Add a Topic']");
    protected SelenideElement searchField = $x("//input[@placeholder='Search by Topic Name']");
    protected SelenideElement showInternalRadioBtn = $x("//input[@name='ShowInternalTopics']");
    protected SelenideElement deleteSelectedTopicsBtn = $x("//button[text()='Delete selected topics']");
    protected SelenideElement copySelectedTopicBtn = $x("//button[text()='Copy selected topic']");
    protected SelenideElement purgeMessagesOfSelectedTopicsBtn = $x("//button[text()='Purge messages of selected topics']");
    protected ElementsCollection topicsGridItems = $$x("//tr[@class]");
    protected String checkBoxListLocator = "//a[@title='%s']//ancestor::td/../td/input[@type='checkbox']";

    @Step
    public TopicsList waitUntilScreenReady() {
        waitUntilSpinnerDisappear();
        topicListHeader.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public TopicsList clickAddTopicBtn() {
        clickByJavaScript(addTopicBtn);
        return this;
    }

    @Step
    public boolean isTopicVisible(String topicName) {
        tableGrid.shouldBe(Condition.visible);
        return isVisible(getTableElement(topicName));
    }

    @Step
    public boolean isShowInternalRadioBtnSelected() {
      return isSelected(showInternalRadioBtn);
    }

    @Step
    public TopicsList selectShowInternalRadioButton() {
      if (!showInternalRadioBtn.is(Condition.selected)) {
        clickByJavaScript(showInternalRadioBtn);
      }
      return this;
    }

    @Step
    public TopicsList unSelectShowInternalRadioButton() {
      if (showInternalRadioBtn.is(Condition.selected)) {
        clickByJavaScript(showInternalRadioBtn);
      }
      return this;
    }

    @Step
    public TopicsList openTopic(String topicName) {
        getTableElement(topicName).shouldBe(Condition.enabled).click();
        return this;
    }

    @Step
    public TopicsList selectCheckboxByName(String topicName){
      SelenideElement checkBox = $x(String.format(checkBoxListLocator,topicName));
      if(!checkBox.is(Condition.selected)){clickByJavaScript(checkBox);}
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

    private List<TopicGridItems> initGridItems() {
      List<TopicGridItems> gridItemList = new ArrayList<>();
      topicsGridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
          .forEach(item -> gridItemList.add(new TopicGridItems(item)));
      return gridItemList;
    }

    @Step
    public List<TopicGridItems> getNonInternalTopics() {
      return initGridItems().stream()
          .filter(e -> !e.isInternal())
          .collect(Collectors.toList());
    }

    @Step
    public List<TopicGridItems> getInternalTopics() {
      return initGridItems().stream()
          .filter(TopicGridItems::isInternal)
          .collect(Collectors.toList());
    }

    public static class TopicGridItems extends BasePage {

      private final SelenideElement element;

      public TopicGridItems(SelenideElement element) {
        this.element = element;
      }

      @Step
      public boolean isInternal() {
        boolean internal = false;
        try {
          element.$x("./td[2]/a/span").shouldBe(Condition.visible);
          internal = true;
        } catch (Throwable ignored) {
        }
        return internal;
      }

      @Step
      public int getCheckBox() {
        return Integer.parseInt(element.$x("./td[1]").getText().trim());
      }

      @Step
      public int getNameElm() {
        return Integer.parseInt(element.$x("./td[2]").getText().trim());
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
    }
}
