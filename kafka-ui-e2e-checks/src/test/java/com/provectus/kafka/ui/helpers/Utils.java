package com.provectus.kafka.ui.helpers;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;
import static com.codeborne.selenide.Selenide.$;

public class Utils {
    public static void refreshUntil(By by) {
        int i = 0;
        do {
            refresh();
            i++;
            sleep(2000);
        } while (getElements(by).size() < 1 && i != 20);
        $(by).shouldBe(Condition.visible);
    }

    public static void waitForSelectedValue(SelenideElement element, String selectedValue) {
        int i = 0;
        do {
            refresh();
            i++;
            sleep(2000);
        } while (!selectedValue.equals(element.getSelectedValue()) && i != 10);
        Assertions.assertEquals(element.getSelectedValue(), selectedValue);
    }
}
