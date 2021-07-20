package com.provectus.kafka.ui.pages;

import lombok.SneakyThrows;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;

public class TopicViewPage {

    @SneakyThrows
    public TopicViewPage openEditSettings() {
        $(By.xpath("//a[@class=\"button\" and text()='Edit settings']")).click();
        return this;
    }

    @SneakyThrows
    public TopicViewPage changeCleanupPolicy(String cleanupPolicyValue) {
        $(By.name("cleanupPolicy")).click();
        $(By.xpath("//select/option[@value = '%s']".formatted(cleanupPolicyValue))).click();
        return this;
    }

    @SneakyThrows
    public TopicViewPage changeTimeToRetainValue(String timeToRetainValue) {
        $(By.id("timeToRetain")).clear();
        $(By.id("timeToRetain")).sendKeys(String.valueOf(timeToRetainValue));
        return this;
    }

    @SneakyThrows
    public TopicViewPage changeMaxSizeOnDisk(String maxSizeOnDisk) {
        $(By.name("retentionBytes")).click();
        $(By.xpath("//select/option[text() = '%s']".formatted(maxSizeOnDisk))).click();
        return this;
    }

    @SneakyThrows
    public TopicViewPage changeMaxMessageBytes(String maxMessageBytes) {
        $(By.name("maxMessageBytes")).clear();
        $(By.name("maxMessageBytes")).sendKeys(String.valueOf(maxMessageBytes));
        return this;
    }

    @SneakyThrows
    public TopicViewPage submitSettingChanges() {
        $(By.xpath("//input[@type='submit']")).click();
        return this;
    }
}