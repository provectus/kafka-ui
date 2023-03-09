package com.provectus.kafka.ui.manualSuite.suite;

import com.provectus.kafka.ui.manualSuite.BaseManualTest;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Automation;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.Test;

import static com.provectus.kafka.ui.utilities.qaseUtils.enums.State.TO_BE_AUTOMATED;

public class KsqlDbTest extends BaseManualTest {

    @Automation(state = TO_BE_AUTOMATED)
    @QaseId(276)
    @Test
    public void testCaseA() {
    }

    @Automation(state = TO_BE_AUTOMATED)
    @QaseId(277)
    @Test
    public void testCaseB() {
    }

    @Automation(state = TO_BE_AUTOMATED)
    @QaseId(278)
    @Test
    public void testCaseC() {
    }

    @Automation(state = TO_BE_AUTOMATED)
    @QaseId(284)
    @Test
    public void testCaseD() {
    }
}
