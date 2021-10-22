package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.base.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import lombok.experimental.ExtensionMethod;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;

@ExtensionMethod({WaitUtils.class})
public class TopicView {
    private static final String path = "ui/clusters/%s/topics/%s";
    private final SelenideElement cleanupPolicy = $(By.name("cleanupPolicy"));
    private final SelenideElement timeToRetain = $(By.id("timeToRetain"));
    private final SelenideElement maxSizeOnDisk = $(By.name("retentionBytes"));
    private final SelenideElement maxMessageBytes = $(By.name("maxMessageBytes"));

    @Step
    public TopicView goTo(String cluster,String topic){
        Selenide.open(TestConfiguration.BASE_URL+path.formatted(cluster,topic));
        return this;
    }

    @Step
    public TopicsList isOnTopicListPage() {
        $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
        $(By.xpath("//span[text()='All Topics']")).shouldBe(Condition.visible);
        return new TopicsList();
    }

    @SneakyThrows
    public TopicView openEditSettings() {
        $(By.xpath("//a[@class=\"button\" and text()='Edit settings']")).click();
        return this;
    }

    @SneakyThrows
    public TopicView clickDeleteTopicButton() {
        $(By.xpath("//*[text()='Delete Topic']")).click();
        $(By.xpath("//*[text()='Confirm']")).click();
        return this;
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

    public TopicView cleanupPolicyIs(String value) {
        cleanupPolicy.waitForSelectedValue(value);
        return this;
    }

    public TopicView timeToRetainIs(String time) {
        Assertions.assertEquals(time, timeToRetain.getValue());
        return this;
    }

    public TopicView maxSizeOnDiskIs(String size) {
        Assertions.assertEquals(size, maxSizeOnDisk.getSelectedText());
        return this;
    }

    public TopicView maxMessageBytesIs(String bytes) {
        Assertions.assertEquals(bytes, maxMessageBytes.getValue());
        return this;
    }
}