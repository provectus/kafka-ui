package com.provectus.kafka.ui.base;

import com.codeborne.selenide.WebDriverRunner;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.screenshots.Screenshooter;
import com.provectus.kafka.ui.steps.Steps;
import org.junit.jupiter.api.BeforeAll;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.Testcontainers;
import org.testcontainers.containers.BindMode;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.DockerImageName;

public class Test {

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

    public static GenericContainer selenoid =
            new GenericContainer(DockerImageName.parse("aerokube/selenoid:latest-release"))
                    .withExposedPorts(4444)
                    .withFileSystemBind("selenoid/config/", "/etc/selenoid", BindMode.READ_WRITE)
                    .withFileSystemBind("/var/run/docker.sock", "/var/run/docker.sock", BindMode.READ_WRITE)
                    .withFileSystemBind("selenoid/video", "/opt/selenoid/video", BindMode.READ_WRITE)
                    .withFileSystemBind("selenoid/logs", "/opt/selenoid/logs", BindMode.READ_WRITE)
                    .withEnv("OVERRIDE_VIDEO_OUTPUT_DIR", "/opt/selenoid/video")
                    .withCommand(
                            "-conf", "/etc/selenoid/browsers.json", "-log-output-dir", "/opt/selenoid/logs");

    public static BrowserWebDriverContainer<?> webDriverContainer =
            new BrowserWebDriverContainer<>()
                    .withCapabilities(new ChromeOptions()
                            .addArguments("--no-sandbox")
                            .addArguments("--disable-dev-shm-usage"));

    @BeforeAll
            public static void start() {
        Testcontainers.exposeHostPorts(8080);
        selenoid.start();
        webDriverContainer.start();
        RemoteWebDriver remoteWebDriver = webDriverContainer.getWebDriver();
        WebDriverRunner.setWebDriver(remoteWebDriver);
    }




/*
   @org.junit.jupiter.api.Test
    void shouldDisplayBook() {

        Configuration.timeout = 2000;
        Configuration.baseUrl = String.format("http://host.testcontainers.internal:%d", 8678);

        RemoteWebDriver remoteWebDriver = webDriverContainer.getWebDriver();
        WebDriverRunner.setWebDriver(remoteWebDriver);

        open("/book-store");

        $(By.id("all-books")).shouldNot(Condition.exist);
        $(By.id("fetch-books")).click();
        $(By.id("all-books")).shouldBe(Condition.visible);
    }*/
}
