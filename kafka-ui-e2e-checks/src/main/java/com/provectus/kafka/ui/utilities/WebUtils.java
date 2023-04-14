package com.provectus.kafka.ui.utilities;

import static com.codeborne.selenide.Selenide.executeJavaScript;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;

@Slf4j
public class WebUtils {

  public static int getTimeout(int... timeoutInSeconds) {
    return (timeoutInSeconds != null && timeoutInSeconds.length > 0) ? timeoutInSeconds[0] : 4;
  }

  public static void sendKeysAfterClear(SelenideElement element, String keys) {
    log.debug("\nsendKeysAfterClear: {} \nsend keys '{}'", element.getSearchCriteria(), keys);
    element.shouldBe(Condition.enabled).clear();
    if (keys != null) {
      element.sendKeys(keys);
    }
  }

  public static void clickByActions(SelenideElement element) {
    log.debug("\nclickByActions: {}", element.getSearchCriteria());
    element.shouldBe(Condition.enabled);
    new Actions(WebDriverRunner.getWebDriver())
        .moveToElement(element)
        .click(element)
        .perform();
  }

  public static void sendKeysByActions(SelenideElement element, String keys) {
    log.debug("\nsendKeysByActions: {} \nsend keys '{}'", element.getSearchCriteria(), keys);
    element.shouldBe(Condition.enabled);
    new Actions(WebDriverRunner.getWebDriver())
        .moveToElement(element)
        .sendKeys(element, keys)
        .perform();
  }

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

  public static boolean isVisible(SelenideElement element, int... timeoutInSeconds) {
    log.debug("\nisVisible: {}", element.getSearchCriteria());
    boolean isVisible = false;
    try {
      element.shouldBe(Condition.visible,
          Duration.ofSeconds(getTimeout(timeoutInSeconds)));
      isVisible = true;
    } catch (Throwable e) {
      log.debug("{} is not visible", element.getSearchCriteria());
    }
    return isVisible;
  }

  public static boolean isEnabled(SelenideElement element, int... timeoutInSeconds) {
    log.debug("\nisEnabled: {}", element.getSearchCriteria());
    boolean isEnabled = false;
    try {
      element.shouldBe(Condition.enabled,
          Duration.ofSeconds(getTimeout(timeoutInSeconds)));
      isEnabled = true;
    } catch (Throwable e) {
      log.debug("{} is not enabled", element.getSearchCriteria());
    }
    return isEnabled;
  }

  public static boolean isSelected(SelenideElement element, int... timeoutInSeconds) {
    log.debug("\nisSelected: {}", element.getSearchCriteria());
    boolean isSelected = false;
    try {
      element.shouldBe(Condition.selected,
          Duration.ofSeconds(getTimeout(timeoutInSeconds)));
      isSelected = true;
    } catch (Throwable e) {
      log.debug("{} is not selected", element.getSearchCriteria());
    }
    return isSelected;
  }

  public static void selectElement(SelenideElement element, boolean select) {
    if (select) {
      if (!element.isSelected()) {
        clickByJavaScript(element);
      }
    } else {
      if (element.isSelected()) {
        clickByJavaScript(element);
      }
    }
  }
}
