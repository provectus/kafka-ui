package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.provectus.kafka.ui.helpers.Utils.refreshUntil;

public class TopicsListPage {
    public static final String path = "ui/clusters/secondLocal/topics";

    @Step
    public TopicsListPage shouldBeOnPage() {
        $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
        $(By.xpath("//span[text()='All Topics']")).shouldBe(Condition.visible);
        return this;
    }

    @SneakyThrows
    public TopicsListPage openTopic(String topicName) {
        refreshUntil(By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']".formatted(topicName)));
        $(By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']".formatted(topicName)))
                .click();
        return this;
    }
    @SneakyThrows
    public TopicsListPage openEditSettings() {
        $(By.xpath("//a[@class=\"button\" and text()='Edit settings']")).click();
        return this;
    }

    @SneakyThrows
    public TopicsListPage changeCleanupPolicy(String cleanupPolicyValue) {
        $(By.name("cleanupPolicy")).click();
        $(By.xpath("//select/option[text() = '%s']".formatted(cleanupPolicyValue))).click();
        return this;
    }

    @SneakyThrows
    public TopicsListPage changeTimeToRetainValue(String timeToRetainValue) {
        $(By.id("timeToRetain")).clear();
        $(By.id("timeToRetain")).sendKeys(String.valueOf(timeToRetainValue));
        return this;
    }

    @SneakyThrows
    public TopicsListPage changeMaxSizeOnDisk(String maxSizeOnDisk) {
        $(By.name("retentionBytes")).click();
        $(By.xpath("//select/option[text() = '%s']".formatted(maxSizeOnDisk))).click();
        return this;
    }

    @SneakyThrows
    public TopicsListPage changeMaxMessageBytes(String maxMessageBytes) {
        $(By.name("maxMessageBytes")).clear();
        $(By.name("maxMessageBytes")).sendKeys(String.valueOf(maxMessageBytes));
        return this;
    }

    @SneakyThrows
    public TopicsListPage submitSettingChanges() {
        $(By.xpath("//input[@type='submit']")).click();
        return this;
    }

}
