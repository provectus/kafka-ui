package com.provectus.kafka.ui.pages.consumer;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;

import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;

public class ConsumersDetails {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement topicGrid = $x("//table");
    protected String consumerIdHeaderLocator = "//h1[contains(text(),'%s')]";
    protected String topicElementLocator = "//tbody//td//a[text()='%s']";
    @Step
    public ConsumersDetails waitUntilScreenReady() {
        loadingSpinner.shouldBe(Condition.disappear);
        topicGrid.shouldBe(Condition.visible);
        return this;
    }
    @Step
    public boolean isRedirectedConsumerTitleVisible(String consumerGroupId) {
        return isVisible($x(String.format(consumerIdHeaderLocator, consumerGroupId)));
    }
    @Step
    public boolean isTopicInConsumersDetailsVisible(String topicName) {
        topicGrid.shouldBe(Condition.visible);
        return isVisible($x(String.format(topicElementLocator, topicName)));
    }

}
