package com.provectus.kafka.ui.qasesuite;

import static com.provectus.kafka.ui.utilities.qase.enums.State.NOT_AUTOMATED;
import static com.provectus.kafka.ui.utilities.qase.enums.Status.DRAFT;

import com.provectus.kafka.ui.utilities.qase.annotations.Automation;
import com.provectus.kafka.ui.utilities.qase.annotations.Status;
import com.provectus.kafka.ui.utilities.qase.annotations.Suite;
import io.qase.api.annotation.QaseTitle;
import io.qase.api.annotation.Step;

public class Template extends BaseQaseTest {

  /**
   * this class is a kind of placeholder or example, use is as template to create new one
   * copy Template into kafka-ui-e2e-checks/src/test/java/com/provectus/kafka/ui/qaseSuite/
   * place it into regarding folder and rename according to test case summary from Qase.io
   * uncomment @Test and set all annotations according to kafka-ui-e2e-checks/QASE.md
   */

  @Automation(state = NOT_AUTOMATED)
  @QaseTitle("testCaseA title")
  @Status(status = DRAFT)
  @Suite(id = 0)
  //  @org.testng.annotations.Test
  public void testCaseA() {
    stepA();
    stepB();
    stepC();
    stepD();
    stepE();
    stepF();
  }

  @Step("stepA action")
  private void stepA() {
  }

  @Step("stepB action")
  private void stepB() {
  }

  @Step("stepC action")
  private void stepC() {
  }

  @Step("stepD action")
  private void stepD() {
  }

  @Step("stepE action")
  private void stepE() {
  }

  @Step("stepF action")
  private void stepF() {
  }
}
