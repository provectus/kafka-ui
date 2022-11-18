package com.provectus.kafka.ui.base;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.WebDriverRunner;
import com.provectus.kafka.ui.utilities.qaseIoUtils.DisplayNameGenerator;
import com.provectus.kafka.ui.utilities.qaseIoUtils.TestCaseGenerator;
import io.github.cdimascio.dotenv.Dotenv;
import io.qameta.allure.Allure;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.*;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.Testcontainers;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.output.Slf4jLogConsumer;
import org.testcontainers.utility.DockerImageName;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;

import static com.provectus.kafka.ui.base.Setup.*;
import static com.provectus.kafka.ui.settings.Source.BASE_WEB_URL;

@Slf4j
@DisplayNameGeneration(DisplayNameGenerator.class)
public class BaseTest extends Facade {

  private static final String SELENIUM_IMAGE_NAME = "selenium/standalone-chrome:103.0";
  private static final String SELENIARM_STANDALONE_CHROMIUM = "seleniarm/standalone-chromium:103.0";
  protected static BrowserWebDriverContainer<?> webDriverContainer = null;

  private static boolean isARM64() {
    return System.getProperty("os.arch").equals("aarch64");
  }

  @BeforeEach
  public void setWebDriver() {
    RemoteWebDriver remoteWebDriver = webDriverContainer.getWebDriver();
    WebDriverRunner.setWebDriver(remoteWebDriver);
    remoteWebDriver.manage().window().setSize(new Dimension(1440, 1024));
    Selenide.open(BASE_WEB_URL);
    naviSideBar.waitUntilScreenReady();
  }

  @BeforeAll
  public static void start() {
    DockerImageName image = isARM64()
        ? DockerImageName.parse(SELENIARM_STANDALONE_CHROMIUM).asCompatibleSubstituteFor(SELENIUM_IMAGE_NAME)
        : DockerImageName.parse(SELENIUM_IMAGE_NAME);
    log.info("Using [{}] as image name for chrome", image.getUnversionedPart());

    webDriverContainer = new BrowserWebDriverContainer<>(image)
        .withEnv("JAVA_OPTS", "-Dwebdriver.chrome.whitelistedIps=")
        .withCapabilities(new ChromeOptions()
            .addArguments("--disable-dev-shm-usage")
            .addArguments("--disable-gpu")
            .addArguments("--no-sandbox")
            .addArguments("--verbose")
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
    if (Config.CLEAR_REPORTS_DIR) {
      clearReports();
    }
    setup();
    Runtime.getRuntime().addShutdownHook(new Thread(() -> {
      if (TestCaseGenerator.FAILED) {
        log.error(
                "Tests FAILED because some problem with @CaseId annotation. Verify that all tests annotated with @CaseId and Id is correct!");
        Runtime.getRuntime().halt(100500);
      }
    }));
  }

  @AfterAll
  public static void tearDown() {
    if (webDriverContainer.isRunning()) {
      webDriverContainer.close();
      webDriverContainer.stop();
    }
  }

  @AfterEach
  public void afterMethod() {
    Allure.addAttachment("Screenshot",
        new ByteArrayInputStream(
            ((TakesScreenshot) webDriverContainer.getWebDriver()).getScreenshotAs(OutputType.BYTES)));
    browserClear();
  }
}
