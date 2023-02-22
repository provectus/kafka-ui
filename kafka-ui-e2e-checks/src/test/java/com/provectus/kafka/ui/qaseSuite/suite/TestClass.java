package com.provectus.kafka.ui.qaseSuite.suite;

import com.provectus.kafka.ui.qaseSuite.BaseQase;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Automation;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Status;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Suite;
import io.qase.api.annotation.QaseTitle;
import io.qase.api.annotation.Step;
import org.testng.annotations.Test;

import static com.provectus.kafka.ui.utilities.qaseUtils.enums.State.NOT_AUTOMATED;
import static com.provectus.kafka.ui.utilities.qaseUtils.enums.Status.DRAFT;

public class TestClass extends BaseQase {

    @Automation(state = NOT_AUTOMATED)
    @QaseTitle("test A")
    @Status(status = DRAFT)
    @Suite(id = 1)
    @Test
    public void testCaseA() {
        stepA();
        stepB();
        stepC();
    }

    @Step("step A")
    private void stepA() {
    }

    @Step("step B")
    private void stepB() {
    }

    @Step("step C")
    private void stepC() {
    }
}
