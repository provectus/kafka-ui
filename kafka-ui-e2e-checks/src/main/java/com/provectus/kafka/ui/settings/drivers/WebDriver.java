package com.provectus.kafka.ui.settings.drivers;

import static com.codeborne.selenide.Selenide.clearBrowserCookies;
import static com.codeborne.selenide.Selenide.clearBrowserLocalStorage;
import static com.codeborne.selenide.Selenide.refresh;
import static com.provectus.kafka.ui.settings.BaseSource.BROWSER;
import static com.provectus.kafka.ui.settings.BaseSource.REMOTE_URL;
import static com.provectus.kafka.ui.variables.Browser.CONTAINER;
import static com.provectus.kafka.ui.variables.Browser.LOCAL;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;
import com.codeborne.selenide.logevents.SelenideLogger;
import io.qameta.allure.Step;
import io.qameta.allure.selenide.AllureSelenide;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.chrome.ChromeOptions;

@Slf4j
public abstract class WebDriver {

  @Step
  public static void browserSetup() {
    Configuration.headless = false;
    Configuration.browser = "chrome";
    Configuration.browserSize = "1920x1080";
    Configuration.screenshots = true;
    Configuration.savePageSource = false;
    Configuration.pageLoadTimeout = 120000;
    ChromeOptions chromeOptions = new ChromeOptions()
        .addArguments("--no-sandbox")
        .addArguments("--verbose")
        .addArguments("--remote-allow-origins=*")
        .addArguments("--disable-dev-shm-usage")
        .addArguments("--disable-gpu")
        .addArguments("--lang=en_US");
    switch (BROWSER) {
      case (LOCAL) -> Configuration.browserCapabilities = chromeOptions;
      case (CONTAINER) -> {
        Configuration.remote = REMOTE_URL;
        Configuration.remoteConnectionTimeout = 180000;
        Map<String, Object> selenoidOptions = new HashMap<>();
        selenoidOptions.put("enableVNC", true);
        selenoidOptions.put("enableVideo", false);
        chromeOptions.setCapability("selenoid:options", selenoidOptions);
        Configuration.browserCapabilities = chromeOptions;
      }
      default -> throw new IllegalStateException("Unexpected value: " + BROWSER);
    }
  }

  private static org.openqa.selenium.WebDriver getWebDriver() {
    try {
      return WebDriverRunner.getWebDriver();
    } catch (IllegalStateException ex) {
      browserSetup();
      Selenide.open();
      return WebDriverRunner.getWebDriver();
    }
  }

  @Step
  public static void openUrl(String url) {
    org.openqa.selenium.WebDriver driver = getWebDriver();
    if (!driver.getCurrentUrl().equals(url)) {
      driver.get(url);
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
    org.openqa.selenium.WebDriver driver = null;
    try {
      driver = WebDriverRunner.getWebDriver();
    } catch (Throwable ignored) {
    }
    if (driver != null) {
      driver.quit();
    }
  }

  @Step
  public static void loggerSetup() {
    SelenideLogger.addListener("AllureSelenide", new AllureSelenide()
        .screenshots(true)
        .savePageSource(false));
  }
}
