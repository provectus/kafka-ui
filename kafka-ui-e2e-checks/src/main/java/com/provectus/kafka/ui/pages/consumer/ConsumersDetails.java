package com.provectus.kafka.ui.pages.consumer;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;

import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;

@ExtensionMethod({WaitUtils.class})
public class ConsumersDetails {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement connectSinkPostgresActivitiesHeader = $x("//h1[text()='connect-sink_postgres_activities']");
    protected SelenideElement topicGrid = $x("//table");
    protected String topicElementLocator = "//tbody//td//a[text()='%s']";

    @Step
    public ConsumersDetails waitUntilScreenReady() {
        loadingSpinner.shouldBe(Condition.disappear);
        topicGrid.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public boolean isRedirectedConsumerTitleVisible() {
        return isVisible($x(String.valueOf(connectSinkPostgresActivitiesHeader)));
    }

    @Step
    public boolean isTopicInConsumersDetailsVisible(String topicName) {
        topicGrid.shouldBe(Condition.visible);
        return isVisible($x(String.format(topicElementLocator, topicName)));
    }

}
