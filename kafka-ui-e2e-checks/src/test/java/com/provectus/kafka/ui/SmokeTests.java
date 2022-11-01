package com.provectus.kafka.ui;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.Test;

public class SmokeTests extends BaseTest {

    @Test
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(198)
    public void checkBasePageElements(){
        SoftAssertions softly = new SoftAssertions();
        topPanel.getAllVisibleElements()
                .forEach(element ->
                        softly.assertThat(element.is(Condition.visible))
                                .as(element.getSearchCriteria() + " isVisible()").isTrue());
        topPanel.getAllEnabledElements()
                .forEach(element ->
                        softly.assertThat(element.is(Condition.enabled))
                                .as(element.getSearchCriteria() + " isEnabled()").isTrue());
        naviSideBar.getAllMenuButtons()
                .forEach(element ->
                        softly.assertThat(element.is(Condition.enabled) && element.is(Condition.visible))
                                .as(element.getSearchCriteria() + " isEnabled()").isTrue());
        softly.assertAll();
    }
}