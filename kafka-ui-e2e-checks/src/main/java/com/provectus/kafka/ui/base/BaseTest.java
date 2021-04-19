package com.provectus.kafka.ui.base;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.logevents.SelenideLogger;
import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.screenshots.Screenshooter;
import io.github.cdimascio.dotenv.Dotenv;
import io.qameta.allure.selenide.AllureSelenide;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testcontainers.containers.BindMode;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.DockerImageName;
import java.io.File;
import java.util.Arrays;

import static com.codeborne.selenide.Selenide.closeWebDriver;

@Slf4j
@DisplayNameGeneration(CamelCaseToSpacedDisplayNameGenerator.class)
public class BaseTest {

  protected Pages pages = Pages.INSTANCE;

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

  static {
    Dotenv.load().entries().forEach(env -> System.setProperty(env.getKey(), env.getValue()));
    if (TestConfiguration.CLEAR_REPORTS_DIR) clearReports();
    String remote = TestConfiguration.SELENOID_URL;
    if (TestConfiguration.SHOULD_START_SELENOID) {
      selenoid.start();
      remote =
          "http://%s:%s/wd/hub"
              .formatted(selenoid.getContainerIpAddress(), selenoid.getMappedPort(4444));
    }
    setupSelenoid(remote);
    SelenideLogger.addListener("allure", new AllureSelenide().savePageSource(false));
  }

  @AfterAll
  public static void afterAll() {
    closeWebDriver();
    selenoid.close();
  }

  @SneakyThrows
  private static void setupSelenoid(String remote) {
    Configuration.reportsFolder = TestConfiguration.REPORTS_FOLDER;
    if (!TestConfiguration.USE_LOCAL_BROWSER) {
      Configuration.remote = remote;
    }
    Configuration.screenshots = TestConfiguration.SCREENSHOTS;
    Configuration.savePageSource = TestConfiguration.SAVE_PAGE_SOURCE;
    Configuration.reopenBrowserOnFail = TestConfiguration.REOPEN_BROWSER_ON_FAIL;
    Configuration.browser = TestConfiguration.BROWSER;
    Configuration.baseUrl = TestConfiguration.BASE_URL;
    Configuration.browserSize = TestConfiguration.BROWSER_SIZE;
    var capabilities = new DesiredCapabilities();
    capabilities.setCapability("enableVNC", TestConfiguration.ENABLE_VNC);
    Configuration.browserCapabilities = capabilities;
  }

  public static void clearReports() {
    log.info("Clearing reports dir [%s]...".formatted(TestConfiguration.REPORTS_FOLDER));
    File allureResults = new File(TestConfiguration.REPORTS_FOLDER);
    if (allureResults.isDirectory()) {
      File[] list = allureResults.listFiles();
      if (list != null)
        Arrays.stream(list)
            .sequential()
            .filter(e -> !e.getName().equals("categories.json"))
            .forEach(File::delete);
    }
  }
}
