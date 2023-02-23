package com.provectus.kafka.ui.qaseSuite;

import io.qase.api.annotation.Step;

public class Template extends BaseQase {

    /**
     * this class is a kind of placeholder or example, use is as template to create new one
     * copy class into kafka-ui-e2e-checks/src/test/java/com/provectus/kafka/ui/qaseSuite/suite
     * remove comment signs and set annotations according to kafka-ui-e2e-checks/src/test/README.md
     */

    /*
     @Automation(state = NOT_AUTOMATED)
     @QaseTitle("testCaseA title")
     @Status(status = DRAFT)
     @Suite(id = #)
     @Test
     */
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
