package com.provectus.kafka.ui.pages.consumer;

import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;

import static com.codeborne.selenide.Selenide.$x;

public class ConsumersList extends BasePage {

    protected SelenideElement consumerListHeader = $x("//h1[text()='Consumers']");
}
