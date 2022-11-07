package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.settings.Source.CLUSTER_NAME;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByActions;

public class NaviSideBar {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement dashboardMenuItem = $x("//a[@title='Dashboard']");
    protected String sideMenuOptionElementLocator = ".//ul/li[contains(.,'%s')]";
    protected String clusterElementLocator = "//aside/ul/li[contains(.,'%s')]";

    private SelenideElement expandCluster(String clusterName) {
        SelenideElement clusterElement = $x(String.format(clusterElementLocator, clusterName)).shouldBe(Condition.visible);
        if (clusterElement.parent().$$x(".//ul").size() == 0) {
            clickByActions(clusterElement);
        }
        return clusterElement;
    }

    @Step
    public NaviSideBar waitUntilScreenReady() {
        loadingSpinner.shouldBe(Condition.disappear, Duration.ofSeconds(30));
        dashboardMenuItem.shouldBe(Condition.visible, Duration.ofSeconds(30));
        return this;
    }

    @Step
    public NaviSideBar openSideMenu(String clusterName, SideMenuOption option) {
        clickByActions(expandCluster(clusterName).parent()
                .$x(String.format(sideMenuOptionElementLocator, option.value)));
        return this;
    }

    @Step
    public NaviSideBar openSideMenu(SideMenuOption option) {
        openSideMenu(CLUSTER_NAME, option);
        return this;
    }

    public enum SideMenuOption {
        DASHBOARD("Dashboard"),
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

    public List<SelenideElement> getAllMenuButtons() {
        expandCluster(CLUSTER_NAME);
        return Stream.of(SideMenuOption.values())
                .map(option -> $x(String.format(sideMenuOptionElementLocator, option.value)))
                .collect(Collectors.toList());
    }
}