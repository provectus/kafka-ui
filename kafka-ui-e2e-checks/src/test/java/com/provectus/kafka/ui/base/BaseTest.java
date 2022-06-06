package com.provectus.kafka.ui.base;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.WebDriverRunner;
import com.codeborne.selenide.logevents.SelenideLogger;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.screenshots.Screenshooter;
import com.provectus.kafka.ui.steps.Steps;
import io.github.cdimascio.dotenv.Dotenv;
import io.qameta.allure.Allure;
import io.qameta.allure.selenide.AllureSelenide;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.Testcontainers;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;

@Slf4j
@DisplayNameGeneration(CamelCaseToSpacedDisplayNameGenerator.class)
public class BaseTest {

    protected Steps steps = Steps.INSTANCE;
    protected Pages pages = Pages.INSTANCE;
    protected Helpers helpers = Helpers.INSTANCE;

    private Screenshooter screenshooter = new Screenshooter();

    public static BrowserWebDriverContainer<?> webDriverContainer =
            new BrowserWebDriverContainer<>()
                    .withCapabilities(new ChromeOptions()
                            .addArguments("--no-sandbox")
                            .addArguments("--disable-dev-shm-usage"))
                    .waitingFor(Wait.defaultWaitStrategy().withStartupTimeout(Duration.ofSeconds(90)));

    public void compareScreenshots(String name) {
        screenshooter.compareScreenshots(name);
    }

    public void compareScreenshots(String name, Boolean shouldUpdateScreenshots) {
        screenshooter.compareScreenshots(name, shouldUpdateScreenshots);
    }

    @BeforeAll
    public static void start() {
        Testcontainers.exposeHostPorts(8080);
        webDriverContainer.start();
        webDriverContainer.isRunning();
        RemoteWebDriver remoteWebDriver = webDriverContainer.getWebDriver();
        WebDriverRunner.setWebDriver(remoteWebDriver);
    }

    static {
        if (!new File("./.env").exists()) {
            try {
                FileUtils.copyFile(new File(".env.example"), new File(".env"));
            } catch (IOException e) {
                log.error("couldn't copy .env.example to .env. Please add .env");
                e.printStackTrace();
            }
        }
        Dotenv.load().entries().forEach(env -> System.setProperty(env.getKey(), env.getValue()));
        if (TestConfiguration.CLEAR_REPORTS_DIR) {
            clearReports();
        }
        setup();
    }


    @AfterEach
    public void afterMethod() {
        webDriverContainer.getWebDriver().manage().deleteAllCookies();
        Allure.addAttachment("Screenshot",
                new ByteArrayInputStream(((TakesScreenshot) webDriverContainer.getWebDriver()).getScreenshotAs(OutputType.BYTES)));
    }

    @SneakyThrows
    private static void setup() {

        Configuration.reportsFolder = TestConfiguration.REPORTS_FOLDER;
        Configuration.screenshots = TestConfiguration.SCREENSHOTS;
        Configuration.savePageSource = TestConfiguration.SAVE_PAGE_SOURCE;
        Configuration.reopenBrowserOnFail = TestConfiguration.REOPEN_BROWSER_ON_FAIL;
        Configuration.browser = TestConfiguration.BROWSER;
        Configuration.baseUrl = TestConfiguration.BASE_WEB_URL;
        Configuration.timeout = 10000;
        Configuration.browserSize = TestConfiguration.BROWSER_SIZE;
        SelenideLogger.addListener("allure", new AllureSelenide().savePageSource(false));
    }

    public static void clearReports() {
        log.info("Clearing reports dir [%s]...".formatted(TestConfiguration.REPORTS_FOLDER));
        File allureResults = new File(TestConfiguration.REPORTS_FOLDER);
        if (allureResults.isDirectory()) {
            File[] list = allureResults.listFiles();
            if (list != null) {
                Arrays.stream(list)
                        .sequential()
                        .filter(e -> !e.getName().equals("categories.json"))
                        .forEach(File::delete);
            }
        }
    }
}
