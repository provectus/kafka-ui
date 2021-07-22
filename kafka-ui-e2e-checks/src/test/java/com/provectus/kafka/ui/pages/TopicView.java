package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.SelenideElement;
import lombok.SneakyThrows;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;

public class TopicViewPage {

    public SelenideElement cleanupPolicy = $(By.name("cleanupPolicy"));
    public SelenideElement timeToRetain = $(By.id("timeToRetain"));
    public SelenideElement maxSizeOnDisk = $(By.name("retentionBytes"));
    public SelenideElement maxMessageBytes = $(By.name("maxMessageBytes"));

    @SneakyThrows
    public TopicView openEditSettings() {
        $(By.xpath("//a[@class=\"button\" and text()='Edit settings']")).click();
        return this;
    }

    @SneakyThrows
    public void  clickDeleteTopicButton() {
        $(By.xpath("//*[text()='Delete Topic']")).click();
        $(By.xpath("//*[text()='Confirm']")).click();
    }

    @SneakyThrows
    public TopicView changeCleanupPolicy(String cleanupPolicyValue) {
        cleanupPolicy.click();
        $(By.xpath("//select/option[@value = '%s']".formatted(cleanupPolicyValue))).click();
        return this;
    }

    @SneakyThrows
    public TopicView changeTimeToRetainValue(String timeToRetainValue) {
        timeToRetain.clear();
        timeToRetain.sendKeys(String.valueOf(timeToRetainValue));
        return this;
    }

    @SneakyThrows
    public TopicView changeMaxSizeOnDisk(String maxSizeOnDiskValue) {
        maxSizeOnDisk.click();
        $(By.xpath("//select/option[text() = '%s']".formatted(maxSizeOnDiskValue))).click();
        return this;
    }

    @SneakyThrows
    public TopicView changeMaxMessageBytes(String maxMessageBytesValue) {
        maxMessageBytes.clear();
        maxMessageBytes.sendKeys(String.valueOf(maxMessageBytesValue));
        return this;
    }

    @SneakyThrows
    public void submitSettingChanges() {
        $(By.xpath("//input[@type='submit']")).click();
    }
}