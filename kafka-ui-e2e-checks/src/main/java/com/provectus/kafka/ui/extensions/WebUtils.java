package com.provectus.kafka.ui.extensions;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;

public class WebUtils {

    public static boolean isVisible(SelenideElement element) {
        boolean isVisible = false;
        try {
            isVisible = element.is(Condition.visible);
        } catch (Throwable e) {
            e.printStackTrace();
        }
        return isVisible;
    }
}
