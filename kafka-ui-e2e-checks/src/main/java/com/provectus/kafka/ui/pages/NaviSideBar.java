package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;

import java.time.Duration;

import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.settings.Source.CLUSTER_NAME;

@ExtensionMethod(WaitUtils.class)
public class NaviSideBar {

    @Step
    public NaviSideBar waitUntilScreenReady() {
        $x("//*[contains(text(),'Loading')]").shouldBe(Condition.disappear);
        $x("//a[@title='Dashboard']").shouldBe(Condition.visible, Duration.ofSeconds(30));
        return this;
    }

    @Step
    public NaviSideBar openSideMenu(String clusterName, SideMenuOption option) {
        SelenideElement clusterElement = $x(String.format("//aside/ul/li[contains(.,'%s')]", clusterName)).shouldBe(Condition.visible);
        if (clusterElement.parent().$$x(".//ul").size() == 0) {
            clusterElement.click();
        }
        clusterElement
                .parent()
                .$x(String.format(".//ul/li[contains(.,'%s')]", option.value))
                .click();
        return this;
    }

    @Step
    public NaviSideBar openSideMenu(SideMenuOption option) {
        openSideMenu(CLUSTER_NAME, option);
        return this;
    }


    public enum SideMenuOption {
        BROKERS("Brokers"),
        TOPICS("Topics"),
        CONSUMERS("Consumers"),
        SCHEMA_REGISTRY("Schema Registry"),
        KAFKA_CONNECT("Kafka Connect"),
        KSQL_DB("KSQL DB");

        final String value;

        SideMenuOption(String value) {
            this.value = value;
        }
    }
}