package com.provectus.kafka.ui.smokeSuite.brokers;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.BaseTest;
import io.qameta.allure.Step;
import io.qase.api.annotation.QaseId;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.BROKERS;
import static com.provectus.kafka.ui.pages.brokers.BrokersDetails.DetailsTab.CONFIGS;

public class BrokersTest extends BaseTest {

    @QaseId(1)
    @Test
    public void checkBrokersOverview() {
        navigateToBrokers();
        Assert.assertTrue(brokersList.getAllBrokers().size() > 0, "getAllBrokers()");
        verifyElementsCondition(brokersList.getAllVisibleElements(), Condition.visible);
        verifyElementsCondition(brokersList.getAllEnabledElements(), Condition.enabled);
    }

    @QaseId(85)
    @Test
    public void checkExistingBrokersInCluster() {
        navigateToBrokers();
        Assert.assertTrue(brokersList.getAllBrokers().size() > 0, "getAllBrokers()");
        brokersList
                .openBroker(1);
        brokersDetails
                .waitUntilScreenReady();
        verifyElementsCondition(brokersDetails.getAllVisibleElements(), Condition.visible);
        verifyElementsCondition(brokersDetails.getAllEnabledElements(), Condition.enabled);
        brokersDetails
                .openDetailsTab(CONFIGS);
        brokersConfigTab
                .waitUntilScreenReady();
        verifyElementsCondition(brokersConfigTab.getColumnHeaders(), Condition.visible);
        verifyElementsCondition(brokersConfigTab.getEditButtons(), Condition.enabled);
        Assert.assertTrue(brokersConfigTab.isSearchByKeyVisible(), "isSearchByKeyVisible()");
    }

    @Step
    private void navigateToBrokers() {
        naviSideBar
                .openSideMenu(BROKERS);
        brokersList
                .waitUntilScreenReady();
    }
}
