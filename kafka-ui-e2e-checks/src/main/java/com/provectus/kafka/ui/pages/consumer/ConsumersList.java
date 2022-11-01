package com.provectus.kafka.ui.pages.consumer;

import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WaitUtils;
import lombok.experimental.ExtensionMethod;

import static com.codeborne.selenide.Selenide.$x;
public class ConsumersList {

    protected SelenideElement consumerListHeader = $x("//h1[text()='Consumers']");
}
