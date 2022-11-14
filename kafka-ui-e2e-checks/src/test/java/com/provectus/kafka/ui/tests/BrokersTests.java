package com.provectus.kafka.ui.tests;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.BROKERS;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class BrokersTests extends BaseTest {
  private static final String SUITE_TITLE = "Brokers";



  @DisplayName("Checking the existing Broker's profile in a cluster")
  @Suite(suiteId = 4, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(85)
  @Test
  public void CheckExistingBrokersInCluster(){
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
    softly.assertThat(brokersDetails.isSegmentSizeVisible()).as("isSegmentSizeVisible()").isTrue();

    softly.assertAll();
  }
}
