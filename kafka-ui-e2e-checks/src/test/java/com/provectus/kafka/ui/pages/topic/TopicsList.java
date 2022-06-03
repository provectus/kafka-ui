package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;

@ExtensionMethod(WaitUtils.class)
public class TopicsList {

    private static final String path = "/ui/clusters/%s/topics";

    @Step
    public TopicsList goTo(String cluster) {
        Selenide.open(TestConfiguration.BASE_WEB_URL + String.format(path, cluster));
        return this;
    }

    @Step
    public TopicsList isOnPage() {
        $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
        $(By.xpath("//h1[text()='All Topics']")).shouldBe(Condition.visible);
        return this;
    }

    @Step
    public TopicCreateEditSettingsView pressCreateNewTopic(){
        BrowserUtils.javaExecutorClick($(".qEXNn.sc-bYEvvW"));
        return new TopicCreateEditSettingsView();
    }

    @Step
    public TopicsList isTopicVisible(String topicName) {
        $$("tbody td>a")
                .shouldBe(CollectionCondition.sizeGreaterThan(4))
                .find(Condition.exactText(topicName))
                .shouldBe(Condition.visible);
        return this;
    }

    @SneakyThrows
    public TopicView openTopic(String topicName) {
        $(By.linkText(topicName)).click();
        return new TopicView();
    }

    @SneakyThrows
    public TopicsList isTopicNotVisible(String topicName) {
        $$x("//table/tbody/tr/td[2]")
                .shouldBe(CollectionCondition.sizeGreaterThanOrEqual(4))
                .find(Condition.exactText(topicName))
                .shouldBe(Condition.not(Condition.visible));
        return this;
    }

}
