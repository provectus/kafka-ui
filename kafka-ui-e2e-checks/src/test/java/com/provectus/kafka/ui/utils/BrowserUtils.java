package com.provectus.kafka.ui.utils;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import org.openqa.selenium.NoSuchElementException;

public class BrowserUtils {

    public static void javaExecutorClick(SelenideElement element){
        Selenide.executeJavaScript("arguments[0].click();", element);
    }

    public static void waitElementPresentJavaExecutor( SelenideElement element ) {
        try {
            Selenide.executeJavaScript("return typeof(arguments[0]) != 'undefined' && arguments[0] != null;",
                    element);
        }
        catch(org.openqa.selenium.StaleElementReferenceException | NoSuchElementException ex){
            Selenide.executeJavaScript("return typeof(arguments[0]) != 'undefined' && arguments[0] != null;",
                    element);
        }
    }
}
