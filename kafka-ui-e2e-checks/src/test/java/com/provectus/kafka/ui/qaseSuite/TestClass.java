package com.provectus.kafka.ui.qaseSuite;

import com.provectus.kafka.ui.utilities.qaseUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import io.qase.api.annotation.QaseId;
import io.qase.api.annotation.QaseTitle;
import org.testng.annotations.Test;

public class TestClass {

    private static final String SUITE_TITLE = "Brokers";
    private static final long SUITE_ID = 1;

    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
//    @QaseId(1)
    @QaseTitle("new brokers test")
    @Test
    public void checkNewBrokersTest() {
        System.out.println("passed");
    }
}
