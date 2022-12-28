package com.provectus.kafka.ui.base;

import static com.codeborne.selenide.Selenide.clearBrowserCookies;
import static com.codeborne.selenide.Selenide.clearBrowserLocalStorage;
import static com.codeborne.selenide.Selenide.refresh;
import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.TOPICS;
import static com.provectus.kafka.ui.settings.Source.BASE_WEB_URL;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import com.provectus.kafka.ui.utilities.qaseIoUtils.DisplayNameGenerator;
import io.qase.api.annotation.Step;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testcontainers.Testcontainers;
import org.testcontainers.containers.BrowserWebDriverContainer;
import org.testcontainers.containers.output.Slf4jLogConsumer;
import org.testcontainers.utility.DockerImageName;

@Slf4j
@DisplayNameGeneration(DisplayNameGenerator.class)
public class BaseTest extends Facade {

  private static final String SELENIUM_IMAGE_NAME = "selenium/standalone-chrome:103.0";
  private static final String SELENIARM_STANDALONE_CHROMIUM = "seleniarm/standalone-chromium:103.0";
  protected static BrowserWebDriverContainer<?> webDriverContainer = null;

  private static boolean isARM64() {
    return System.getProperty("os.arch").equals("aarch64");
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

  @AfterAll
  public static void tearDown() {
    if (webDriverContainer.isRunning()) {
      webDriverContainer.close();
      webDriverContainer.stop();
    }
  }

  @BeforeEach
  public void beforeMethod() {
    RemoteWebDriver remoteWebDriver = webDriverContainer.getWebDriver();
    WebDriverRunner.setWebDriver(remoteWebDriver);
    remoteWebDriver.manage()
        .window().setSize(new Dimension(1440, 1024));
    Selenide.open(BASE_WEB_URL);
    naviSideBar.waitUntilScreenReady();
  }

  @AfterEach
  public void afterMethod() {
    clearBrowserLocalStorage();
    clearBrowserCookies();
    refresh();
  }

  @Step
  protected void navigateToTopics() {
    naviSideBar
        .openSideMenu(TOPICS);
    topicsList
        .waitUntilScreenReady();
  }

  @Step
  protected void navigateToTopicsAndOpenDetails(String topicName){
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
    SoftAssertions softly = new SoftAssertions();
    elementList.forEach(element -> softly.assertThat(element.is(expectedCondition))
        .as(element.getSearchCriteria() + " is " + expectedCondition).isTrue());
    softly.assertAll();
  }
}
