package com.provectus.kafka.ui.manualSuite.suite;

import com.provectus.kafka.ui.manualSuite.BaseManualTest;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Automation;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.Test;

import static com.provectus.kafka.ui.utilities.qaseUtils.enums.State.TO_BE_AUTOMATED;

public class BrokersTest extends BaseManualTest {

    @Automation(state = TO_BE_AUTOMATED)
    @QaseId(330)
    @Test
    public void testCaseA() {
    }
}
