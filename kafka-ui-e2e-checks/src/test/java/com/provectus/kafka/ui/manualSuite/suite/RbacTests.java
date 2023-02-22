package com.provectus.kafka.ui.manualSuite.suite;

import com.provectus.kafka.ui.manualSuite.BaseManual;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Automation;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.Test;

import static com.provectus.kafka.ui.utilities.qaseUtils.enums.State.NOT_AUTOMATED;

public class RbacTests extends BaseManual {

    @Automation(state = NOT_AUTOMATED)
    @QaseId(249)
    @Test
    public void testCaseA() {
    }

    @Automation(state = NOT_AUTOMATED)
    @QaseId(251)
    @Test
    public void testCaseB() {
    }

    @Automation(state = NOT_AUTOMATED)
    @QaseId(257)
    @Test
    public void testCaseC() {
    }

    @Automation(state = NOT_AUTOMATED)
    @QaseId(258)
    @Test
    public void testCaseD() {
    }

    @Automation(state = NOT_AUTOMATED)
    @QaseId(259)
    @Test
    public void testCaseE() {
    }

    @Automation(state = NOT_AUTOMATED)
    @QaseId(260)
    @Test
    public void testCaseF() {
    }

    @Automation(state = NOT_AUTOMATED)
    @QaseId(261)
    @Test
    public void testCaseG() {
    }
}
