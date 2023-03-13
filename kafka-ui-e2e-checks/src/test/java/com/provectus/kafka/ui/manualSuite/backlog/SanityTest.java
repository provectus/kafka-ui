package com.provectus.kafka.ui.manualSuite.backlog;

import com.provectus.kafka.ui.manualSuite.BaseManualTest;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Automation;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Suite;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.Test;

import static com.provectus.kafka.ui.utilities.qaseUtils.enums.State.TO_BE_AUTOMATED;

public class SanityTest extends BaseManualTest {

    @Automation(state = TO_BE_AUTOMATED)
    @Suite(id = 19)
    @QaseId(285)
    @Test
    public void testCaseA() {
    }
}
