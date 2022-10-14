package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.refresh;

public class ProduceMessagePanel {

    private final SelenideElement keyField = $(By.xpath("//div[@id='key']/textarea"));
    private final SelenideElement contentField = $(By.xpath("//div[@id='content']/textarea"));
    private final SelenideElement headersField = $(By.xpath("//div[@id='headers']/textarea"));
    private final SelenideElement submitBtn = headersField.$(By.xpath("../../../..//button[@type='submit']"));

    @Step
    public ProduceMessagePanel setKeyField(String value) {
        keyField.shouldBe(Condition.enabled)
                .sendKeys(Keys.chord(Keys.DELETE));
        keyField.setValue(value);
        return this;
    }

    @Step
    public ProduceMessagePanel setContentFiled(String value) {
        contentField.shouldBe(Condition.enabled)
                .sendKeys(Keys.DELETE);
        contentField.setValue(value);
        return this;
    }

    @Step
    public ProduceMessagePanel setHeaderFiled(String value) {
        headersField.setValue(value);
        return new ProduceMessagePanel();
    }

    @Step
    public TopicDetails submitProduceMessage() {
        submitBtn.shouldBe(Condition.enabled).click();
        submitBtn.shouldBe(Condition.disappear);
        refresh();
        return new TopicDetails();
    }
}
