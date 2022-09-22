package com.provectus.kafka.ui.extensions;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class WebUtils {

    public static boolean isVisible(SelenideElement element) {
        boolean isVisible = false;
        try {
            element.shouldBe(Condition.visible);
            isVisible = true;
        } catch (Throwable e) {
            log.debug("Element {} is not visible", element.getSearchCriteria());
        }
        return isVisible;
    }
}