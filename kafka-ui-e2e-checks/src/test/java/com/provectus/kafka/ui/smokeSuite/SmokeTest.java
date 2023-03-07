package com.provectus.kafka.ui.smokeSuite;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.BaseTest;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.Test;

import java.util.stream.Collectors;
import java.util.stream.Stream;

public class SmokeTest extends BaseTest {

    @QaseId(198)
    @Test
    public void checkBasePageElements() {
        verifyElementsCondition(
                Stream.concat(topPanel.getAllVisibleElements().stream(), naviSideBar.getAllMenuButtons().stream())
                        .collect(Collectors.toList()), Condition.visible);
        verifyElementsCondition(
                Stream.concat(topPanel.getAllEnabledElements().stream(), naviSideBar.getAllMenuButtons().stream())
                        .collect(Collectors.toList()), Condition.enabled);
    }
}
