package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
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

    @Step
    public TopicsList waitUntilScreenReady() {
        $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
        $(By.xpath("//h1[text()='Topics']")).shouldBe(Condition.visible);
        return this;
    }

    @Step
    public TopicCreateEditForm pressCreateNewTopic() {
        clickByJavaScript($x("//button[normalize-space(text()) ='Add a Topic']"));
        return new TopicCreateEditForm();
    }

    @Step
    public boolean isTopicVisible(String topicName) {
        $(By.xpath("//table")).shouldBe(Condition.visible);
        return isVisible($x("//tbody//td//a[text()='" + topicName + "']"));
    }

    @Step
    public TopicDetails openTopic(String topicName) {
        $(By.linkText(topicName)).click();
        return new TopicDetails();
    }
}
