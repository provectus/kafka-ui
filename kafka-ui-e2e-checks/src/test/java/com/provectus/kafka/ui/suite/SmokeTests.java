package com.provectus.kafka.ui.suite;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.junit.jupiter.api.Test;

public class SmokeTests extends BaseTest {

    @Test
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(198)
    public void checkBasePageElements(){
      verifyElementsCondition(topPanel.getAllVisibleElements(), Condition.visible);
      verifyElementsCondition(topPanel.getAllEnabledElements(), Condition.enabled);
      verifyElementsCondition(naviSideBar.getAllMenuButtons(), Condition.visible);
    }
}
