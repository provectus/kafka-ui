package com.provectus.kafka.ui;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class SmokeTests extends BaseTest {

    @Test
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(198)
    @DisplayName("main page should load")
    void mainPageLoads() {
        compareScreenshots("main");
    }

    //some text for commit
}
