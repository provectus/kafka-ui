package com.provectus.kafka.ui.suite.brokers;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.BROKERS;
import static org.assertj.core.api.Assertions.assertThat;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;

public class BrokersTests extends BaseTest {
  private static final String SUITE_TITLE = "Brokers";
  private static final long SUITE_ID = 1;

  @DisplayName("Checking the Brokers overview")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(1)
  @Test
  @Order(1)
  public void CheckBrokersOverview(){
    naviSideBar
        .openSideMenu(BROKERS);
    brokersList
        .waitUntilScreenReady();
    naviSideBar
        .getAllMenuButtons()
        .forEach(element ->
            assertThat(element.is(Condition.enabled) && element.is(Condition.visible))
                .as(element.getSearchCriteria() + " isEnabled()").isTrue());
    brokersList
        .waitUntilScreenReady();
    SoftAssertions softly = new SoftAssertions();
    softly.assertThat(brokersList.getBroker()).as("getBroker()").size().isGreaterThan(0);
    brokersList.getAllVisibleElements().forEach(element -> softly.assertThat(element.is(Condition.visible))
        .as(element.getSearchCriteria() + " isVisible()").isTrue());
    brokersList.getAllEnabledElements().forEach(element -> softly.assertThat(element.is(Condition.enabled))
        .as(element.getSearchCriteria() + " isEnabled()").isTrue());
    softly.assertAll();
  }

  @DisplayName("Checking the existing Broker's profile in a cluster")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(85)
  @Test
  @Order(2)
  public void checkExistingBrokersInCluster(){
    naviSideBar
        .openSideMenu(BROKERS);
    brokersList
        .waitUntilScreenReady();
    assertThat(brokersList.isBrokerVisible("1")).as("isBrokerVisible()").isTrue();
    brokersList
        .openBroker("1");
    brokersDetails
        .waitUntilScreenReady();
    SoftAssertions softly = new SoftAssertions();
    brokersDetails.getAllVisibleElements().forEach(element -> softly.assertThat(element.is(Condition.visible))
        .as(element.getSearchCriteria() + " isVisible()").isTrue());
    brokersDetails.getAllEnabledElements().forEach(element -> softly.assertThat(element.is(Condition.enabled))
        .as(element.getSearchCriteria() + " isEnabled()").isTrue());
    softly.assertAll();
  }
}
