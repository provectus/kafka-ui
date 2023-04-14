package com.provectus.kafka.ui.manualsuite.backlog;

import static com.provectus.kafka.ui.qasesuite.BaseQaseTest.BROKERS_SUITE_ID;
import static com.provectus.kafka.ui.qasesuite.BaseQaseTest.KSQL_DB_SUITE_ID;
import static com.provectus.kafka.ui.qasesuite.BaseQaseTest.TOPICS_PROFILE_SUITE_ID;
import static com.provectus.kafka.ui.utilities.qase.enums.State.TO_BE_AUTOMATED;

import com.provectus.kafka.ui.manualsuite.BaseManualTest;
import com.provectus.kafka.ui.utilities.qase.annotations.Automation;
import com.provectus.kafka.ui.utilities.qase.annotations.Suite;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.Test;

public class SmokeBacklog extends BaseManualTest {

  @Automation(state = TO_BE_AUTOMATED)
  @Suite(id = BROKERS_SUITE_ID)
  @QaseId(330)
  @Test
  public void testCaseA() {
  }

  @Automation(state = TO_BE_AUTOMATED)
  @Suite(id = KSQL_DB_SUITE_ID)
  @QaseId(277)
  @Test
  public void testCaseB() {
  }

  @Automation(state = TO_BE_AUTOMATED)
  @Suite(id = KSQL_DB_SUITE_ID)
  @QaseId(278)
  @Test
  public void testCaseC() {
  }

  @Automation(state = TO_BE_AUTOMATED)
  @Suite(id = KSQL_DB_SUITE_ID)
  @QaseId(284)
  @Test
  public void testCaseD() {
  }

  @Automation(state = TO_BE_AUTOMATED)
  @Suite(id = BROKERS_SUITE_ID)
  @QaseId(331)
  @Test
  public void testCaseE() {
  }

  @Automation(state = TO_BE_AUTOMATED)
  @Suite(id = BROKERS_SUITE_ID)
  @QaseId(332)
  @Test
  public void testCaseF() {
  }

  @Automation(state = TO_BE_AUTOMATED)
  @Suite(id = TOPICS_PROFILE_SUITE_ID)
  @QaseId(335)
  @Test
  public void testCaseG() {
  }

  @Automation(state = TO_BE_AUTOMATED)
  @Suite(id = TOPICS_PROFILE_SUITE_ID)
  @QaseId(336)
  @Test
  public void testCaseH() {
  }
}
