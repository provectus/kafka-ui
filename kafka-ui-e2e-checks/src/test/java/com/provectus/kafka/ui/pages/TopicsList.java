package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.helpers.WaitUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.provectus.kafka.ui.helpers.WaitUtils.refreshUntil;

public class TopicsList {
    public static final String path = "ui/clusters/secondLocal/topics";

    @Step
    public TopicsList isOnPage() {
        $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
        $(By.xpath("//span[text()='All Topics']")).shouldBe(Condition.visible);
        return this;
    }

    @SneakyThrows
    public TopicsList openTopic(String topicName) {
        WaitUtils.refreshUntil(By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']"
                .formatted(topicName)));
        $(By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']".formatted(topicName)))
                .click();
        return this;
    }

    @SneakyThrows
    public TopicsList isDeleted(String topicName) {
        refreshUntil(By.xpath("//div[contains(@class,'section')]//table"));
        $(By.xpath("//a[text()='%s']".formatted(topicName))).shouldNotBe(Condition.visible);
        return this;
    }

}
