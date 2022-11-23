package com.provectus.kafka.ui.pages.topic;

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

public class TopicsList extends BasePage {

    protected SelenideElement topicListHeader = $x("//*[text()='Topics']");
    protected SelenideElement addTopicBtn = $x("//button[normalize-space(text()) ='Add a Topic']");
    protected SelenideElement searchField = $x("//input[@placeholder='Search by Topic Name']");
    protected SelenideElement showInternalRadioBtn = $x("//input[@name='ShowInternalTopics']");
    protected SelenideElement deleteSelectedTopicsBtn = $x("//button[text()='Delete selected topics']");
    protected SelenideElement copySelectedTopicBtn = $x("//button[text()='Copy selected topic']");
    protected SelenideElement purgeMessagesOfSelectedTopicsBtn = $x("//button[text()='Purge messages of selected topics']");
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
    public TopicsList openTopic(String topicName) {
        getTableElement(topicName).shouldBe(Condition.enabled).click();
        return this;
    }

    @Step
    public TopicsList selectCheckboxByName(String topicName){
      $x(String.format(checkBoxListLocator, topicName)).shouldBe(Condition.enabled).click();
      return this;
    }

    @Step
    public SelenideElement getDisabledActionButtons(){
      return copySelectedTopicBtn;
    }

    @Step
    public List<SelenideElement> getEnabledActionButtons(){
      return new ArrayList<>(getActionButtons());
    }

    private List<SelenideElement> getActionButtons() {
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
}
