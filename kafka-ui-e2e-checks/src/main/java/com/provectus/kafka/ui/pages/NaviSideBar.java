package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

@ExtensionMethod(WaitUtils.class)
public class NaviSideBar {

    @Step
    public NaviSideBar openSideMenu(String clusterName, SideMenuOptions sideMenuOptions) {
        SelenideElement clusterElement = $x(String.format("//aside/ul/li[contains(.,'%s')]", clusterName)).shouldBe(Condition.visible);
        if (clusterElement.parent().$$x(".//ul").size() == 0) {
            clusterElement.click();
        }
        clusterElement
                .parent()
                .$x(String.format(".//ul/li[contains(.,'%s')]", sideMenuOptions.value))
                .click();
        return this;
    }



    public enum SideMenuOptions {
        BROKERS("Brokers"),
        TOPICS("Topics"),
        CONSUMERS("Consumers"),
        SCHEMA_REGISTRY("Schema Registry"),
        KAFKA_CONNECT("Kafka Connect"),
        KSQL_DB("KSQL DB");

        final String value;

        SideMenuOptions(String value) {
            this.value = value;
        }
    }

    @Step
    public void waitUntilScreenReady() {
        $x("//*[contains(text(),'Loading')]").shouldBe(Condition.disappear);
        $x("//h1[text()='Dashboard']").shouldBe(Condition.visible);
    }
}