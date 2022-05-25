package com.provectus.kafka.ui.base;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.logevents.SelenideLogger;
import com.github.dockerjava.api.DockerClient;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.screenshots.Screenshooter;
import com.provectus.kafka.ui.steps.Steps;
import io.github.cdimascio.dotenv.Dotenv;
import io.qameta.allure.selenide.AllureSelenide;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.Testcontainers;
import org.testcontainers.containers.BindMode;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.utility.DockerImageName;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;

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

    public static Network appNetwork = new Network() {
        @Override
        public String getId() {
            return "kafka-ui";
        }

        @Override
        public void close() {

        }

        @Override
        public Statement apply(Statement base, Description description) {
            return null;
        }
    };


    public static GenericContainer selenoid =
            new GenericContainer(DockerImageName.parse("aerokube/selenoid:latest-release"))
                    .withExposedPorts(4444)
                    .withFileSystemBind("selenoid/config/", "/etc/selenoid", BindMode.READ_WRITE)
                    .withFileSystemBind("/var/run/docker.sock", "/var/run/docker.sock", BindMode.READ_WRITE)
                    .withFileSystemBind("selenoid/video", "/opt/selenoid/video", BindMode.READ_WRITE)
                    .withFileSystemBind("selenoid/logs", "/opt/selenoid/logs", BindMode.READ_WRITE)
                    .withEnv("OVERRIDE_VIDEO_OUTPUT_DIR", "/opt/selenoid/video")
                .withNetwork(appNetwork)
                    .withCommand(
                            "-conf", "/etc/selenoid/browsers.json", "-log-output-dir", "/opt/selenoid/logs");

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
            DockerClient client = DockerClientFactory.instance().client();
            DockerClientFactory.instance().checkAndPullImage(client, "selenoid/vnc_chrome:96.0");
            selenoid.withAccessToHost(true);
            selenoid.start();
            Testcontainers.exposeHostPorts(8080);
            remote =
                    "http://%s:%s/wd/hub"
                            .formatted(selenoid.getContainerIpAddress(), selenoid.getMappedPort(4444));

        }

        Configuration.reportsFolder = TestConfiguration.REPORTS_FOLDER;
        if (!TestConfiguration.USE_LOCAL_BROWSER) {
            Configuration.remote = remote;
//            TestConfiguration.BASE_URL =
//                    TestConfiguration.BASE_URL.replace("localhost", "host.docker.internal");
        }
        Configuration.screenshots = TestConfiguration.SCREENSHOTS;
        Configuration.savePageSource = TestConfiguration.SAVE_PAGE_SOURCE;
        Configuration.reopenBrowserOnFail = TestConfiguration.REOPEN_BROWSER_ON_FAIL;
        Configuration.browser = TestConfiguration.BROWSER;
        Configuration.baseUrl = TestConfiguration.BASE_DOCKER_URL;
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
