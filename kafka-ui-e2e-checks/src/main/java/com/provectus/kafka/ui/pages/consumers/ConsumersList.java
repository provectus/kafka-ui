package com.provectus.kafka.ui.pages.consumers;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;

import static com.codeborne.selenide.Selenide.$x;

public class ConsumersList extends BasePage {

    protected SelenideElement consumerListHeader = $x("//h1[text()='Consumers']");
    
    @Step
    public ConsumersList waitUntilScreenReady() {
        waitUntilSpinnerDisappear();
        consumerListHeader.shouldHave(Condition.visible);
        return this;
    }
}
