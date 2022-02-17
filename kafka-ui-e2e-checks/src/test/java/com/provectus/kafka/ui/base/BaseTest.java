package com.provectus.kafka.ui.base;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.logevents.SelenideLogger;
import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.model.Container;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.screenshots.Screenshooter;
import com.provectus.kafka.ui.steps.Steps;
import io.github.bonigarcia.wdm.WebDriverManager;
import io.github.cdimascio.dotenv.Dotenv;
import io.qameta.allure.selenide.AllureSelenide;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.Testcontainers;
import org.testcontainers.containers.BindMode;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.DockerImageName;

@Slf4j
@DisplayNameGeneration(CamelCaseToSpacedDisplayNameGenerator.class)
public class BaseTest {

    protected Steps steps = Steps.INSTANCE;
    protected Pages pages = Pages.INSTANCE;
    protected Helpers helpers = Helpers.INSTANCE;

    private Screenshooter screenshooter = new Screenshooter();

    public void compareScreenshots(String name) {
        screenshooter.compareScreenshots(name);
    }

    public void compareScreenshots(String name, Boolean shouldUpdateScreenshots) {
        screenshooter.compareScreenshots(name, shouldUpdateScreenshots);
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
        setupSelenoid();
    }

    @AfterAll
    public static void afterAll() {
//        closeWebDriver();
//        selenoid.close();
    }

    @SneakyThrows
    private static void setupSelenoid() {
        String remote = TestConfiguration.SELENOID_URL;
        if (TestConfiguration.SHOULD_START_SELENOID) {
            WebDriverManager wdm = WebDriverManager.chromedriver().browserInDocker();
            wdm.create();
            remote = wdm.getDockerSeleniumServerUrl().toString();
        }

        Configuration.reportsFolder = TestConfiguration.REPORTS_FOLDER;
        if (!TestConfiguration.USE_LOCAL_BROWSER) {
            Configuration.remote = remote;
            TestConfiguration.BASE_URL =
                    TestConfiguration.BASE_URL.replace("localhost", "host.docker.internal");
        }
        Configuration.screenshots = TestConfiguration.SCREENSHOTS;
        Configuration.savePageSource = TestConfiguration.SAVE_PAGE_SOURCE;
        Configuration.reopenBrowserOnFail = TestConfiguration.REOPEN_BROWSER_ON_FAIL;
        Configuration.browser = TestConfiguration.BROWSER;
        Configuration.baseUrl = TestConfiguration.BASE_URL;
        Configuration.timeout = 10000;
        Configuration.browserSize = TestConfiguration.BROWSER_SIZE;
        SelenideLogger.addListener("AllureSelenide", new AllureSelenide().savePageSource(false));
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
