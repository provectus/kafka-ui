package com.provectus.kafka.ui.utilities;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Selenide.executeJavaScript;

@Slf4j
public class WebUtils {

    public static void clickByJavaScript(SelenideElement element) {
        log.debug("\nclickByJavaScript: {}", element.getSearchCriteria());
        element.shouldBe(Condition.enabled);
        String script = "arguments[0].click();";
        executeJavaScript(script, element);
    }

    public static void clearByKeyboard(SelenideElement field) {
        log.debug("\nclearByKeyboard: {}", field.getSearchCriteria());
        field.shouldBe(Condition.enabled).sendKeys(Keys.END);
        field.sendKeys(Keys.chord(Keys.CONTROL + "a"), Keys.DELETE);
    }

    public static boolean isVisible(SelenideElement element) {
        log.debug("\nisVisible: {}", element.getSearchCriteria());
        boolean isVisible = false;
        try {
            element.shouldBe(Condition.visible);
            isVisible = true;
        } catch (Throwable e) {
            log.debug("{} is not visible", element.getSearchCriteria());
        }
        return isVisible;
    }
}