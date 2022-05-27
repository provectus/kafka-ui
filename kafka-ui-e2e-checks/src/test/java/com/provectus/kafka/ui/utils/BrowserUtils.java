package com.provectus.kafka.ui.utils;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class BrowserUtils {

    public static void clickAction(WebDriver driver, WebElement element ) {
        Actions actions = new Actions(driver);
        actions.click(element);
        actions.build().perform();
    }

    public static WebElement waitForVisibility( WebDriver driver, WebElement element, int timeToWaitInSec ) {
        try {
            element = new WebDriverWait(driver, Duration.ofSeconds(timeToWaitInSec)).until(ExpectedConditions.visibilityOf(element));
        }
        catch(org.openqa.selenium.StaleElementReferenceException | NoSuchElementException ex)
        {
            driver.navigate().refresh();
            element = new WebDriverWait(driver, Duration.ofSeconds(timeToWaitInSec)).until(ExpectedConditions.visibilityOf(element));
        }
        return element;
    }

    public static void isElementPresentCheckUsingJavaScriptExecutor( WebDriver driver, WebElement element ) {
        JavascriptExecutor jse = (JavascriptExecutor) driver;
        jse.executeScript("return typeof(arguments[0]) != 'undefined' && arguments[0] != null;",
                element);
    }

    public static void javaExecutorClick( WebDriver driver, WebElement element ) {
        isElementPresentCheckUsingJavaScriptExecutor(driver, element);
        JavascriptExecutor executor = (JavascriptExecutor) driver;
        executor.executeScript("arguments[0].click();", element);
    }

    public static void waitElementPresentJavaExecutor( WebDriver driver, WebElement element ) {
        JavascriptExecutor executor = (JavascriptExecutor) driver;
        try {
            executor.executeScript("return typeof(arguments[0]) != 'undefined' && arguments[0] != null;",
                    element);
        }
        catch(org.openqa.selenium.StaleElementReferenceException | NoSuchElementException ex){
            executor.executeScript("return typeof(arguments[0]) != 'undefined' && arguments[0] != null;",
                    element);
        }
    }
}
