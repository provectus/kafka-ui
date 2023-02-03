package com.provectus.kafka.ui.pages.consumers;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;

import static com.codeborne.selenide.Selenide.$x;

public class ConsumersDetails extends BasePage {

    protected String consumerIdHeaderLocator = "//h1[contains(text(),'%s')]";
    protected String topicElementLocator = "//tbody//td//a[text()='%s']";

    @Step
    public ConsumersDetails waitUntilScreenReady() {
        waitUntilSpinnerDisappear();
        tableGrid.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public boolean isRedirectedConsumerTitleVisible(String consumerGroupId) {
        return isVisible($x(String.format(consumerIdHeaderLocator, consumerGroupId)));
    }

    @Step
    public boolean isTopicInConsumersDetailsVisible(String topicName) {
        tableGrid.shouldBe(Condition.visible);
        return isVisible($x(String.format(topicElementLocator, topicName)));
    }
}
