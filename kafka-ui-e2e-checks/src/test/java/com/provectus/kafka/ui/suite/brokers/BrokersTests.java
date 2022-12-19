package com.provectus.kafka.ui.suite.brokers;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.BROKERS;
import static org.assertj.core.api.Assertions.assertThat;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.pages.brokers.BrokersDetails;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qameta.allure.Step;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class BrokersTests extends BaseTest {
  private static final String SUITE_TITLE = "Brokers";
  private static final long SUITE_ID = 1;

  @DisplayName("Checking the Brokers overview")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(1)
  @Test
  public void checkBrokersOverview(){
    navigateToBrokers();
    assertThat(brokersList.getAllBrokers()).as("getAllBrokers()").size().isGreaterThan(0);
    verifyElementsCondition(brokersList.getAllVisibleElements(), Condition.visible);
    verifyElementsCondition(brokersList.getAllEnabledElements(), Condition.enabled);
  }

  @DisplayName("Checking the existing Broker's profile in a cluster")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(85)
  @Test
  public void checkExistingBrokersInCluster(){
    navigateToBrokers();
    assertThat(brokersList.getAllBrokers()).as("getAllBrokers()").size().isGreaterThan(0);
    brokersList
        .openBroker("1");
    brokersDetails
        .waitUntilScreenReady();
    verifyElementsCondition(brokersDetails.getAllVisibleElements(), Condition.visible);
    verifyElementsCondition(brokersDetails.getAllVisibleElements(), Condition.enabled);
    brokersDetails
        .waitUntilScreenReady()
        .openDetailsTab(BrokersDetails.BrokerMenu.CONFIGS);
    verifyElementsCondition(brokersConfigTabPanel.getColumnHeaders(), Condition.visible);
    SoftAssertions softly = new SoftAssertions();
    softly.assertThat(brokersConfigTabPanel.isEditButtonEnabled()).as("isEditButtonEnabled()").isTrue();
    softly.assertThat(brokersConfigTabPanel.isSearchByKeyVisible()).as("isSearchByKeyVisible()").isTrue();
    softly.assertAll();
  }

  @Step
  private void navigateToBrokers(){
    naviSideBar
        .openSideMenu(BROKERS);
    brokersList
        .waitUntilScreenReady();
  }
}
