package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import java.util.List;

import static com.codeborne.selenide.Selenide.*;

public class ProduceMessagePanel {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement keyField = $(By.xpath("//div[@id='key']/textarea"));
    protected SelenideElement contentField = $(By.xpath("//div[@id='content']/textarea"));
    protected SelenideElement headersField = $(By.xpath("//div[@id='headers']/textarea"));
    protected SelenideElement submitBtn = headersField.$(By.xpath("../../../..//button[@type='submit']"));
    protected List<SelenideElement> ddElementsLocator = $$x("//ul[@role='listbox']");

    @Step
    public ProduceMessagePanel waitUntilScreenReady(){
        loadingSpinner.shouldBe(Condition.disappear);
        ddElementsLocator.forEach(element -> element.shouldBe(Condition.visible));
        return this;
    }

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
        return this;
    }

    @Step
    public TopicDetails submitProduceMessage() {
        submitBtn.shouldBe(Condition.enabled).click();
        submitBtn.shouldBe(Condition.disappear);
        refresh();
        return new TopicDetails();
    }
}
