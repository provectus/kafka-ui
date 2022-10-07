package com.provectus.kafka.ui.utilities;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import lombok.extern.slf4j.Slf4j;

import static com.codeborne.selenide.Selenide.executeJavaScript;

@Slf4j
public class WebUtils {

    public static void clickByJavaScript(SelenideElement element) {
        element.shouldBe(Condition.enabled);
        String script = "arguments[0].click();";
        executeJavaScript(script, element);
    }

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