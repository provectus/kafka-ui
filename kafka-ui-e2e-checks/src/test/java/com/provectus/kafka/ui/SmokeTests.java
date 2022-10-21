package com.provectus.kafka.ui;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.codeborne.selenide.Selenide.$$x;

public class SmokeTests extends BaseTest {
    protected List<SelenideElement> activeButtons = $$x("//button[contains(text(),'Log out')]/ancestor::div[position() = 1]/a");
    protected List<SelenideElement> visibleElements = $$x("//nav[@role='navigation']//a");

    @Test
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(198)
    @DisplayName("Main page loaded correctly")
    public void checkBasePageElements(){
        SoftAssertions softly = new SoftAssertions();

        visibleElements.forEach(element ->
                softly.assertThat(element.is(Condition.visible))
                        .as(element.getSearchCriteria() + "isEnabled").isTrue());

//        topPanel.getAllVisibleElements()
//                .forEach(element ->
//                        softly.assertThat(element.is(Condition.visible))
//                                .as(element.getSearchCriteria() + " isVisible").isTrue());

        activeButtons.forEach(element ->
                softly.assertThat(element.is(Condition.enabled))
                        .as(element.getSearchCriteria() + "isEnabled").isTrue());

//        topPanel.getAllEnabledElements()
//                .forEach(element ->
//                        softly.assertThat(element.is(Condition.enabled))
//                                .as(element.getSearchCriteria() + " isEnabled").isTrue());

        naviSideBar.getAllBtns()
                .forEach(element ->
                        softly.assertThat(element.is(Condition.enabled))
                                .as(element.getSearchCriteria() + " isEnabled").isTrue());
        softly.assertAll();
    }
}