package com.provectus.kafka.ui;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class SmokeTests extends BaseTest {
//    protected List<SelenideElement> activeButtons = $$x("//button[contains(text(),'Log out')]/ancestor::div[position() = 1]/a");
//    protected List<SelenideElement> visibleElements = $$x("//nav[@role='navigation']//a");

    @Test
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(198)
    @DisplayName("Main page loaded correctly")
    public void checkBasePageElements(){
        SoftAssertions softly = new SoftAssertions();

        topPanel.getAllVisibleElements()
                .forEach(element ->
                        softly.assertThat(element.is(Condition.visible))
                                .as(element.getSearchCriteria() + " isVisible").isTrue());

        topPanel.getAllEnabledElements()
                .forEach(element ->
                        softly.assertThat(element.is(Condition.enabled))
                                .as(element.getSearchCriteria() + " isEnabled").isTrue());

        naviSideBar.getAllBtns()
                .forEach(element ->
                        softly.assertThat(element.is(Condition.enabled))
                                .as(element.getSearchCriteria() + " isEnabled").isTrue());
        softly.assertAll();
    }
}