package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;

import java.util.Arrays;

import static com.codeborne.selenide.Selenide.$x;
import static com.codeborne.selenide.Selenide.refresh;
import static com.provectus.kafka.ui.utilities.WebUtils.clearByKeyboard;

public class ProduceMessagePanel {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement keyTextArea = $x("//div[@id='key']/textarea");
    protected SelenideElement contentTextArea = $x("//div[@id='content']/textarea");
    protected SelenideElement headersTextArea = $x("//div[@id='headers']/textarea");
    protected SelenideElement submitBtn = headersTextArea.$x("../../../..//button[@type='submit']");
    protected SelenideElement partitionDdl = $x("//ul[@name='partition']");
    protected SelenideElement keySerdeDdl = $x("//ul[@name='keySerde']");
    protected SelenideElement contentSerdeDdl = $x("//ul[@name='valueSerde']");

    @Step
    public ProduceMessagePanel waitUntilScreenReady(){
        loadingSpinner.shouldBe(Condition.disappear);
        Arrays.asList(partitionDdl, keySerdeDdl, contentSerdeDdl).forEach(element -> element.shouldBe(Condition.visible));
        return this;
    }

    @Step
    public ProduceMessagePanel setKeyField(String value) {
        clearByKeyboard(keyTextArea);
        keyTextArea.setValue(value);
        return this;
    }

    @Step
    public ProduceMessagePanel setContentFiled(String value) {
        clearByKeyboard(contentTextArea);
        contentTextArea.setValue(value);
        return this;
    }

    @Step
    public ProduceMessagePanel setHeaderFiled(String value) {
        headersTextArea.setValue(value);
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
