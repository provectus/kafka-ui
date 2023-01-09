package com.provectus.kafka.ui.settings.drivers;

import static com.codeborne.selenide.Selenide.clearBrowserCookies;
import static com.codeborne.selenide.Selenide.clearBrowserLocalStorage;
import static com.codeborne.selenide.Selenide.open;
import static com.codeborne.selenide.Selenide.refresh;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.WebDriverRunner;
import com.codeborne.selenide.logevents.SelenideLogger;
import io.qameta.allure.Step;
import io.qameta.allure.selenide.AllureSelenide;
import org.openqa.selenium.chrome.ChromeOptions;

public abstract class LocalWebDriver {

  private static org.openqa.selenium.WebDriver getWebDriver() {
    try {
      return WebDriverRunner.getWebDriver();
    } catch (IllegalStateException ex) {
      Configuration.headless = false;
      Configuration.browser = "chrome";
      Configuration.browserSize = "1920x1080";
      /**screenshots and savePageSource config is needed for local debug
       * optionally can be set as 'false' to not duplicate Allure report
       */
      Configuration.screenshots = true;
      Configuration.savePageSource = true;
      Configuration.pageLoadTimeout = 120000;
      Configuration.browserCapabilities = new ChromeOptions()
          .addArguments("--lang=en_US");
      open();
      return WebDriverRunner.getWebDriver();
    }
  }

  @Step
  public static void openUrl(String url) {
    if (!getWebDriver().getCurrentUrl().equals(url)) {
      getWebDriver().get(url);
    }
  }

  @Step
  public static void browserInit() {
    getWebDriver();
  }

  @Step
  public static void browserClear() {
    clearBrowserLocalStorage();
    clearBrowserCookies();
    refresh();
  }

  @Step
  public static void browserQuit() {
    getWebDriver().quit();
  }

  @Step
  public static void loggerSetup() {
    SelenideLogger.addListener("AllureSelenide", new AllureSelenide()
        .screenshots(true)
        .savePageSource(false));
  }
}
