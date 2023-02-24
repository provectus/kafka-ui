package com.provectus.kafka.ui.smokeSuite;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.testng.annotations.Test;

import java.util.stream.Collectors;
import java.util.stream.Stream;

public class SmokeTest extends BaseTest {

    @Test
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(198)
    public void checkBasePageElements() {
        verifyElementsCondition(
                Stream.concat(topPanel.getAllVisibleElements().stream(), naviSideBar.getAllMenuButtons().stream())
                        .collect(Collectors.toList()), Condition.visible);
        verifyElementsCondition(
                Stream.concat(topPanel.getAllEnabledElements().stream(), naviSideBar.getAllMenuButtons().stream())
                        .collect(Collectors.toList()), Condition.enabled);
    }
}
