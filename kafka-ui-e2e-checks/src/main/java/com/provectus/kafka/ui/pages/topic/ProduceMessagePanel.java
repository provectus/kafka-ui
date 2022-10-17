package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.Keys;

import java.util.Arrays;

import static com.codeborne.selenide.Selenide.$x;
import static com.codeborne.selenide.Selenide.refresh;

public class ProduceMessagePanel {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement keyField = $x("//div[@id='key']/textarea");
    protected SelenideElement contentField = $x("//div[@id='content']/textarea");
    protected SelenideElement headersField = $x("//div[@id='headers']/textarea");
    protected SelenideElement submitBtn = headersField.$x("../../../..//button[@type='submit']");
    protected SelenideElement ddlPartition = $x("//ul[@name='partition']");
    protected SelenideElement ddlKeySerde = $x("//ul[@name='keySerde']");
    protected SelenideElement ddlContentSerde = $x("//ul[@name='valueSerde']");

    @Step
    public ProduceMessagePanel waitUntilScreenReady(){
        loadingSpinner.shouldBe(Condition.disappear);
        Arrays.asList(ddlPartition,ddlKeySerde,ddlContentSerde).forEach(element -> element.shouldBe(Condition.visible));
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
    public ProduceMessagePanel submitProduceMessage() {
        submitBtn.shouldBe(Condition.enabled).click();
        submitBtn.shouldBe(Condition.disappear);
        refresh();
        return this;
    }
}
