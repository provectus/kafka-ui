package com.provectus.kafka.ui.base;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.WebDriverRunner;
import com.codeborne.selenide.logevents.SelenideLogger;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.helpers.TestConfiguration;
import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.screenshots.Screenshooter;
import com.provectus.kafka.ui.utils.CamelCaseToSpacedDisplayNameGenerator;
import com.provectus.kafka.ui.utils.driverSetup.DriverFactory;
import com.provectus.kafka.ui.utils.qaseIO.TestCaseGenerator;
import io.github.cdimascio.dotenv.Dotenv;
import io.qameta.allure.Allure;
import io.qameta.allure.selenide.AllureSelenide;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;

@Slf4j
@DisplayNameGeneration(CamelCaseToSpacedDisplayNameGenerator.class)
public class BaseTest {

    protected Pages pages = Pages.INSTANCE;
    protected Helpers helpers = Helpers.INSTANCE;

    private final Screenshooter screenshooter = new Screenshooter();

    private static final String SELENOID_IMAGE_NAME = TestConfiguration.SELENOID_IMAGE_NAME;
    private static final String SELENOID_IMAGE_TAG = TestConfiguration.SELENOID_IMAGE_TAG;
    private static final String CHROME_TAG = TestConfiguration.VNC_CHROME_TAG;
    private RemoteWebDriver remoteWebDriver = null;
   // private static final GenericContainer<?> selenoid;
   // private static final GenericContainer<?> chrome;

 /*   static {
        selenoid = new GenericContainer<>(DockerImageName.parse(SELENOID_IMAGE_NAME + ":" + SELENOID_IMAGE_TAG))
                .withExposedPorts(4444)
                .withFileSystemBind("selenoid/config/", "/etc/selenoid", BindMode.READ_WRITE)
                .withFileSystemBind("/var/run/docker.sock", "/var/run/docker.sock", BindMode.READ_WRITE)
                .withFileSystemBind("selenoid/video", "/opt/selenoid/video", BindMode.READ_WRITE)
                .withFileSystemBind("selenoid/logs", "/opt/selenoid/logs", BindMode.READ_WRITE)
                .withEnv("OVERRIDE_VIDEO_OUTPUT_DIR", "/opt/selenoid/video")
                .withCommand(
                        "-conf /etc/selenoid/browsers.json -log-output-dir /opt/selenoid/logs");

        chrome = new GenericContainer<>(DockerImageName.parse(String.format("selenoid/vnc_chrome:%s", CHROME_TAG)))
                .withExposedPorts(8080)
                .withCommand("--add-host=host.docker.internal:host-gateway");
        chrome.withAccessToHost(true);

        selenoid.start();
        chrome.start();
    }*/

    public void compareScreenshots(String name) {
        screenshooter.compareScreenshots(name);
    }

    public void compareScreenshots(String name, Boolean shouldUpdateScreenshots) {
        screenshooter.compareScreenshots(name, shouldUpdateScreenshots);
    }

    @BeforeEach
    public void setWebDriver() {
      //  if (chrome.isRunning() && selenoid.isRunning()) {
            remoteWebDriver = DriverFactory.createDriver(4444);
            WebDriverRunner.setWebDriver(remoteWebDriver);
            remoteWebDriver.manage().window().setSize(new Dimension(1440, 1024));
      //  }
    }

    @AfterEach
    public void afterMethod() {
        Allure.addAttachment("Screenshot",
                new ByteArrayInputStream(((TakesScreenshot) remoteWebDriver).getScreenshotAs(OutputType.BYTES)));
        remoteWebDriver.close();
        remoteWebDriver.quit();
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
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            if (TestCaseGenerator.FAILED) {
                log.error("Tests FAILED because some problem with @CaseId annotation. Verify that all tests annotated with @CaseId and Id is correct!");
                Runtime.getRuntime().halt(100500);
            }
        }));
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
        log.info(String.format("Clearing reports dir [%s]...", TestConfiguration.REPORTS_FOLDER));
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
