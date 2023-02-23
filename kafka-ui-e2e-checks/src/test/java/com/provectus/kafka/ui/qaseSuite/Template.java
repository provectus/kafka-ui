package com.provectus.kafka.ui.qaseSuite;

import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Automation;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Status;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Suite;
import io.qase.api.annotation.QaseTitle;
import io.qase.api.annotation.Step;

import static com.provectus.kafka.ui.utilities.qaseUtils.enums.State.NOT_AUTOMATED;
import static com.provectus.kafka.ui.utilities.qaseUtils.enums.Status.DRAFT;

public class Template extends BaseQase {

    /**
     * this class is a kind of placeholder or example, use is as template to create new one
     * copy class into kafka-ui-e2e-checks/src/test/java/com/provectus/kafka/ui/qaseSuite/suite
     * uncomment @Test and set all annotations according to kafka-ui-e2e-checks/src/test/README.md
     */

    @Automation(state = NOT_AUTOMATED)
    @QaseTitle("testCaseA title")
    @Status(status = DRAFT)
    @Suite(id = 0)
//    @Test
    public void testCaseA() {
        stepA();
        stepB();
        stepC();
        stepD();
        stepE();
        stepF();
    }

    @Step("stepA description")
    private void stepA() {
    }

    @Step("stepB description")
    private void stepB() {
    }

    @Step("stepC description")
    private void stepC() {
    }

    @Step("stepD description")
    private void stepD() {
    }

    @Step("stepE description")
    private void stepE() {
    }

    @Step("stepF description")
    private void stepF() {
    }
}
