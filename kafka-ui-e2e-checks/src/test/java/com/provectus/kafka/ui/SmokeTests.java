package com.provectus.kafka.ui;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import io.qase.api.annotation.CaseId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class SmokeTests extends BaseTest {

    @Test
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(198)
    @DisplayName("main page should load")
    void mainPageLoads() {
        pages.open()
                .waitUntilScreenReady();
        compareScreenshots("main");
    }
}
