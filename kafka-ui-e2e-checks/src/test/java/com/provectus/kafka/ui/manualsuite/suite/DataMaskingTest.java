package com.provectus.kafka.ui.manualsuite.suite;

import static com.provectus.kafka.ui.utilities.qase.enums.State.NOT_AUTOMATED;

import com.provectus.kafka.ui.manualsuite.BaseManualTest;
import com.provectus.kafka.ui.utilities.qase.annotations.Automation;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.Test;

public class DataMaskingTest extends BaseManualTest {

  @Automation(state = NOT_AUTOMATED)
  @QaseId(262)
  @Test
  public void testCaseA() {
  }

  @Automation(state = NOT_AUTOMATED)
  @QaseId(264)
  @Test
  public void testCaseB() {
  }

  @Automation(state = NOT_AUTOMATED)
  @QaseId(265)
  @Test
  public void testCaseC() {
  }
}
