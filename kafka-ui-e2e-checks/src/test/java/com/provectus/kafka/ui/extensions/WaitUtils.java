package com.provectus.kafka.ui.extensions;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;
import static com.codeborne.selenide.Selenide.$;

public class WaitUtils {
    public static void refreshUntil(By by, Condition condition) {
        int i = 0;
        do {
            refresh();
            i++;
            sleep(2000);
        } while ($$(by).size() < 1 && i != 20);
        $(by).shouldBe(condition);
    }

    public static void waitForSelectedValue(SelenideElement element, String selectedValue) {
        int i = 0;
        do {
            refresh();
            i++;
            sleep(2000);
        } while (!selectedValue.equals(element.getSelectedValue()) && i != 60);
        Assertions.assertEquals(selectedValue, element.getSelectedValue()) ;
    }
}
