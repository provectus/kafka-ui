package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;

@ExtensionMethod(WaitUtils.class)
public class TopicsList {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement topicListHeader = $x("//h1[text()='Topics']");
    protected SelenideElement addTopicBtn = $x("//button[normalize-space(text()) ='Add a Topic']");
    protected SelenideElement topicGrid = $x("//table");
    protected String topicElementLocator = "//tbody//td//a[text()='%s']";

    @Step
    public TopicsList waitUntilScreenReady() {
        loadingSpinner.shouldBe(Condition.disappear);
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
        topicGrid.shouldBe(Condition.visible);
        return isVisible($x(String.format(topicElementLocator,topicName)));
    }

    @Step
    public TopicsList openTopic(String topicName) {
        $(By.linkText(topicName))
                .shouldBe(Condition.enabled).click();
        return this;
    }
}
