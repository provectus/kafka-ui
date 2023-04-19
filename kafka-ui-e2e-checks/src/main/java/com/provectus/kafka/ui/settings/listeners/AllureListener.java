package com.provectus.kafka.ui.settings.listeners;

import static java.nio.file.Files.newInputStream;

import com.codeborne.selenide.Screenshots;
import io.qameta.allure.Allure;
import io.qameta.allure.testng.AllureTestNg;
import java.io.File;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.testng.ITestListener;
import org.testng.ITestResult;

@Slf4j
public class AllureListener extends AllureTestNg implements ITestListener {

  private void takeScreenshot() {
    File screenshot = Screenshots.takeScreenShotAsFile();
    try {
      if (screenshot != null) {
        Allure.addAttachment(screenshot.getName(), newInputStream(screenshot.toPath()));
      } else {
        log.warn("Unable to take screenshot");
      }
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void onTestFailure(ITestResult result) {
    takeScreenshot();
  }

  @Override
  public void onTestSkipped(ITestResult result) {
    takeScreenshot();
  }
}
