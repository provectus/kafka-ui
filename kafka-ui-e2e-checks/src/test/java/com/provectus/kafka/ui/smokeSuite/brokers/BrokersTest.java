package com.provectus.kafka.ui.smokeSuite.brokers;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qameta.allure.Step;
import io.qase.api.annotation.CaseId;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.BROKERS;
import static com.provectus.kafka.ui.pages.broker.BrokersDetails.DetailsTab.CONFIGS;

public class BrokersTest extends BaseTest {

    private static final String SUITE_TITLE = "Brokers";
    private static final long SUITE_ID = 1;

    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(1)
    @Test
    public void checkBrokersOverview() {
        navigateToBrokers();
        Assert.assertTrue(brokersList.getAllBrokers().size() > 0, "getAllBrokers()");
        verifyElementsCondition(brokersList.getAllVisibleElements(), Condition.visible);
        verifyElementsCondition(brokersList.getAllEnabledElements(), Condition.enabled);
    }

    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(85)
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
