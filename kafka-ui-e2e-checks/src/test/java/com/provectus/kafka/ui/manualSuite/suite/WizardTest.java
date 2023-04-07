package com.provectus.kafka.ui.manualSuite.suite;

import static com.provectus.kafka.ui.utilities.qaseUtils.enums.State.NOT_AUTOMATED;

import com.provectus.kafka.ui.manualSuite.BaseManualTest;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Automation;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.Test;

public class WizardTest extends BaseManualTest {

  @Automation(state = NOT_AUTOMATED)
  @QaseId(333)
  @Test
  public void testCaseA() {
  }
}
