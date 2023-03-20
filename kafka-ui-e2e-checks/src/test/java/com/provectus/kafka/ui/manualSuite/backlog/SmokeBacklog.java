package com.provectus.kafka.ui.manualSuite.backlog;

import com.provectus.kafka.ui.manualSuite.BaseManualTest;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Automation;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Suite;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.Test;

import static com.provectus.kafka.ui.utilities.qaseUtils.enums.State.TO_BE_AUTOMATED;

public class SmokeBacklog extends BaseManualTest {

    @Automation(state = TO_BE_AUTOMATED)
    @Suite(id = 1)
    @QaseId(330)
    @Test
    public void testCaseA() {
    }

    @Automation(state = TO_BE_AUTOMATED)
    @Suite(id = 8)
    @QaseId(276)
    @Test
    public void testCaseB() {
    }

    @Automation(state = TO_BE_AUTOMATED)
    @Suite(id = 8)
    @QaseId(277)
    @Test
    public void testCaseC() {
    }

    @Automation(state = TO_BE_AUTOMATED)
    @Suite(id = 8)
    @QaseId(278)
    @Test
    public void testCaseD() {
    }

    @Automation(state = TO_BE_AUTOMATED)
    @Suite(id = 8)
    @QaseId(284)
    @Test
    public void testCaseE() {
    }

    @Automation(state = TO_BE_AUTOMATED)
    @Suite(id = 1)
    @QaseId(331)
    @Test
    public void testCaseF() {
    }

    @Automation(state = TO_BE_AUTOMATED)
    @Suite(id = 1)
    @QaseId(332)
    @Test
    public void testCaseG() {
    }
}
