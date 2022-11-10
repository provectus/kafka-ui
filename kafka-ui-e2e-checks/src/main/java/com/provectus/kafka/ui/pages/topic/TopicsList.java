package com.provectus.kafka.ui.pages.topic;

import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import java.util.List;
import lombok.experimental.ExtensionMethod;

@ExtensionMethod(WaitUtils.class)
public class TopicsList extends BasePage {

    protected SelenideElement topicListHeader = $x("//h1[text()='Topics']");
    protected SelenideElement addTopicBtn = $x("//button[normalize-space(text()) ='Add a Topic']");
    protected SelenideElement searchField = $x("//input[@placeholder='Search by Topic Name']");
    protected SelenideElement showInternalCheckbox = $x("//input[@name='ShowInternalTopics']");
    protected List<SelenideElement> tableColumnsName = $$x("//table//tr/th/div");

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
    public boolean isSearchFieldActive(){
      return isVisible(searchField) && isEnabled(searchField);
    }

    @Step
    public boolean isShowInternalTopicsActive() {
      return isEnabled(showInternalCheckbox);
    }

    @Step
    public boolean isAddTopicButtonVisible(){
      return isEnabled(addTopicBtn);
    }

    @Step
    public TopicsList isTableColumnVisible(){
      tableColumnsName.forEach(names -> names.shouldBe(Condition.visible));
      return this;
    }
}
