package com.provectus.kafka.ui.settings.drivers;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;
import com.codeborne.selenide.logevents.SelenideLogger;
import io.qameta.allure.Step;
import io.qameta.allure.selenide.AllureSelenide;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;

import static com.codeborne.selenide.Selenide.*;
import static com.provectus.kafka.ui.settings.BaseSource.BROWSER;
import static com.provectus.kafka.ui.settings.BaseSource.REMOTE_URL;
import static com.provectus.kafka.ui.variables.Browser.CONTAINER;
import static com.provectus.kafka.ui.variables.Browser.LOCAL;

public abstract class WebDriver {

    @Step
    public static void browserSetup() {
        Configuration.headless = false;
        Configuration.browser = "chrome";
        Configuration.browserSize = "1920x1080";
        /**screenshots and savePageSource config is needed for local debug
         * optionally can be set as 'false' to not duplicate Allure report
         */
        Configuration.screenshots = true;
        Configuration.savePageSource = false;
        Configuration.pageLoadTimeout = 120000;
        ChromeOptions options = new ChromeOptions()
                .addArguments("--no-sandbox")
                .addArguments("--verbose")
                .addArguments("--remote-allow-origins=*")
                .addArguments("--disable-dev-shm-usage")
                .addArguments("--disable-gpu")
                .addArguments("--lang=en_US");
        switch (BROWSER) {
            case (LOCAL) -> Configuration.browserCapabilities = options;
            case (CONTAINER) -> {
                Configuration.remote = REMOTE_URL;
                Configuration.remoteConnectionTimeout = 180000;
                DesiredCapabilities capabilities = new DesiredCapabilities();
                capabilities.setCapability("enableVNC", true);
                capabilities.setCapability("enableVideo", false);
                Configuration.browserCapabilities = capabilities.merge(options);
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
        if (!driver.getCurrentUrl().equals(url)) driver.get(url);
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
        if (driver != null) driver.quit();
    }

    @Step
    public static void loggerSetup() {
        SelenideLogger.addListener("AllureSelenide", new AllureSelenide()
                .screenshots(true)
                .savePageSource(false));
    }
}
