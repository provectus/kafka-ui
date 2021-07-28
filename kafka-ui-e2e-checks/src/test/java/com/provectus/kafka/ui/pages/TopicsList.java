package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;

@ExtensionMethod(WaitUtils.class)
public class TopicsList {
    private static final String path = "ui/clusters/%s/topics";

    @Step
    public TopicsList goTo(String cluster) {
        Selenide.open(TestConfiguration.BASE_URL+path.formatted(cluster));
        return this;
    }

    @Step
    public TopicsList isOnPage() {
        $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
        $(By.xpath("//span[text()='All Topics']")).shouldBe(Condition.visible);
        return this;
    }

    @SneakyThrows
    public TopicsList openTopic(String topicName) {
        By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']"
                .formatted(topicName)).refreshUntil(Condition.visible);
        $(By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']".formatted(topicName)))
                .click();
        return this;
    }

    @SneakyThrows
    public TopicsList isNotVisible(String topicName) {
        By.xpath("//div[contains(@class,'section')]//table").refreshUntil(Condition.visible);
        $(By.xpath("//a[text()='%s']".formatted(topicName))).shouldNotBe(Condition.visible);
        return this;
    }

}
