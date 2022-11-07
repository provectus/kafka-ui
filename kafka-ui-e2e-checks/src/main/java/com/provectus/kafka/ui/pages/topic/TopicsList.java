package com.provectus.kafka.ui.pages.topic;

import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;

@ExtensionMethod(WaitUtils.class)
public class TopicsList extends BasePage {

    protected SelenideElement topicListHeader = $x("//h1[text()='Topics']");
    protected SelenideElement addTopicBtn = $x("//button[normalize-space(text()) ='Add a Topic']");
//    protected SelenideElement topicGrid = $x("//table");
//    protected String topicElementLocator = "//tbody//td//a[text()='%s']";

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
        return isVisible($x(String.format(tableElementNameLocator,topicName)));
    }

    @Step
    public TopicsList openTopic(String topicName) {
        clickTableElement(topicName);
//        $(By.linkText(topicName))
//                .shouldBe(Condition.enabled).click();
        return this;
    }
}
