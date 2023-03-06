package com.provectus.kafka.ui;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import com.provectus.kafka.ui.settings.listeners.AllureListener;
import com.provectus.kafka.ui.settings.listeners.LoggerListener;
import com.provectus.kafka.ui.settings.listeners.QaseResultListener;
import io.qameta.allure.Step;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.Testcontainers;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.output.Slf4jLogConsumer;
import org.testcontainers.utility.DockerImageName;
import org.testng.annotations.*;
import org.testng.asserts.SoftAssert;

import java.time.Duration;
import java.util.List;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.BROKERS;
import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.TOPICS;
import static com.provectus.kafka.ui.settings.BaseSource.*;
import static com.provectus.kafka.ui.settings.drivers.LocalWebDriver.*;
import static com.provectus.kafka.ui.utilities.qaseUtils.QaseSetup.qaseIntegrationSetup;
import static com.provectus.kafka.ui.variables.Browser.CONTAINER;
import static com.provectus.kafka.ui.variables.Browser.LOCAL;

@Slf4j
@Listeners({AllureListener.class, LoggerListener.class, QaseResultListener.class})
public abstract class BaseTest extends Facade {

    private static final String SELENIUM_IMAGE_NAME = "selenium/standalone-chrome:103.0";
    private static final String SELENIARM_STANDALONE_CHROMIUM = "seleniarm/standalone-chromium:103.0";
    protected static BrowserWebDriverContainer<?> webDriverContainer = null;

    private static boolean isARM64() {
        return System.getProperty("os.arch").equals("aarch64");
    }

    @BeforeSuite(alwaysRun = true)
    public void beforeSuite() {
        qaseIntegrationSetup();
        switch (BROWSER) {
            case (CONTAINER) -> {
                DockerImageName image = isARM64()
                        ? DockerImageName.parse(SELENIARM_STANDALONE_CHROMIUM).asCompatibleSubstituteFor(SELENIUM_IMAGE_NAME)
                        : DockerImageName.parse(SELENIUM_IMAGE_NAME);
                log.info("Using [{}] as image name for chrome", image.getUnversionedPart());
                webDriverContainer = new BrowserWebDriverContainer<>(image)
                        .withEnv("JAVA_OPTS", "-Dwebdriver.chrome.whitelistedIps=")
                        .withStartupTimeout(Duration.ofSeconds(180))
                        .withCapabilities(new ChromeOptions()
                                .addArguments("--disable-dev-shm-usage")
                                .addArguments("--disable-gpu")
                                .addArguments("--no-sandbox")
                                .addArguments("--verbose")
                                .addArguments("--lang=es")
                        )
                        .withLogConsumer(new Slf4jLogConsumer(log).withPrefix("[CHROME]: "));
                try {
                    Testcontainers.exposeHostPorts(8080);
                    log.info("Starting browser container");
                    webDriverContainer.start();
                } catch (Throwable e) {
                    log.error("Couldn't start a container", e);
                }
            }
            case (LOCAL) -> loggerSetup();
            default -> throw new IllegalStateException("Unexpected value: " + BROWSER);
        }
    }

    @AfterSuite(alwaysRun = true)
    public void afterSuite() {
        switch (BROWSER) {
            case (CONTAINER) -> {
                if (webDriverContainer.isRunning()) {
                    webDriverContainer.close();
                    webDriverContainer.stop();
                }
            }
            case (LOCAL) -> browserQuit();
            default -> throw new IllegalStateException("Unexpected value: " + BROWSER);
        }
    }

    @BeforeMethod(alwaysRun = true)
    public void beforeMethod() {
        switch (BROWSER) {
            case (CONTAINER) -> {
                RemoteWebDriver remoteWebDriver = webDriverContainer.getWebDriver();
                WebDriverRunner.setWebDriver(remoteWebDriver);
                remoteWebDriver.manage()
                        .window().setSize(new Dimension(1440, 1024));
                Selenide.open(BASE_CONTAINER_URL);
            }
            case (LOCAL) -> openUrl(BASE_LOCAL_URL);
            default -> throw new IllegalStateException("Unexpected value: " + BROWSER);
        }
        naviSideBar.waitUntilScreenReady();
    }

    @AfterMethod(alwaysRun = true)
    public void afterMethod() {
        browserClear();
    }
    
    @Step
    protected void navigateToBrokers() {
        naviSideBar
                .openSideMenu(BROKERS);
        brokersList
                .waitUntilScreenReady();
    }

    @Step
    protected void navigateToTopics() {
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady();
    }

    @Step
    protected void navigateToTopicsAndOpenDetails(String topicName) {
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
                .openTopic(topicName);
        topicDetails
                .waitUntilScreenReady();
    }

    @Step
    protected void verifyElementsCondition(List<SelenideElement> elementList, Condition expectedCondition) {
        SoftAssert softly = new SoftAssert();
        elementList.forEach(element -> softly.assertTrue(element.is(expectedCondition),
                element.getSearchCriteria() + " is " + expectedCondition));
        softly.assertAll();
    }
}
