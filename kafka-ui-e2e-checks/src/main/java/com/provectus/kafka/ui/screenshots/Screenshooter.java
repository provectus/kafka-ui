package com.provectus.kafka.ui.screenshots;

import io.qameta.allure.Allure;
import io.qameta.allure.Attachment;
import lombok.SneakyThrows;
import org.junit.jupiter.api.Assertions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ru.yandex.qatools.ashot.AShot;
import ru.yandex.qatools.ashot.Screenshot;
import ru.yandex.qatools.ashot.comparison.ImageDiff;
import ru.yandex.qatools.ashot.comparison.ImageDiffer;
import ru.yandex.qatools.ashot.coordinates.WebDriverCoordsProvider;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.file.FileSystems;
import java.util.List;

import static com.codeborne.selenide.WebDriverRunner.getWebDriver;

public class Screenshooter {

  public static  Logger log = LoggerFactory.getLogger(Screenshooter.class);

  private static final int PIXELS_THRESHOLD =
      Integer.parseInt(System.getProperty("PIXELS_THRESHOLD", "200"));
  private static final String SCREENSHOTS_FOLDER =
      System.getProperty("SCREENSHOTS_FOLDER", "com/provectus/kafka/ui/screenshots/");
  private static final String DIFF_SCREENSHOTS_FOLDER =
      System.getProperty("DIFF_SCREENSHOTS_FOLDER", "build/__diff__/");
  private static final String ACTUAL_SCREENSHOTS_FOLDER =
      System.getProperty("ACTUAL_SCREENSHOTS_FOLDER", "build/__actual__/");
  private static final boolean SHOULD_SAVE_SCREENSHOTS_IF_NOT_EXIST =
      Boolean.parseBoolean(System.getProperty("SHOULD_SAVE_SCREENSHOTS_IF_NOT_EXIST", "true"));
  private static final boolean TURN_OFF_SCREENSHOTS =
      Boolean.parseBoolean(System.getProperty("TURN_OFF_SCREENSHOTS", "false"));
  private static final boolean USE_LOCAL_BROWSER =
          Boolean.parseBoolean(System.getProperty("USE_LOCAL_BROWSER", "false"));

  private File newFile(String name) {
    var file = new File(name);
    if (!file.exists()) {
      file.mkdirs();
    }
    return file;
  }

  public Screenshooter() {
    List.of(SCREENSHOTS_FOLDER, DIFF_SCREENSHOTS_FOLDER, ACTUAL_SCREENSHOTS_FOLDER)
        .forEach(this::newFile);
  }

  public void compareScreenshots(String name) {
    compareScreenshots(name, false);
  }

  @SneakyThrows
  public void compareScreenshots(String name, boolean shouldUpdateScreenshotIfDiffer) {
    if (TURN_OFF_SCREENSHOTS || USE_LOCAL_BROWSER) {
      log.warn(String.format("compareScreenshots turned off due TURN_OFF_SCREENSHOTS || USE_LOCAL_BROWSER: %b || %b"
              , TURN_OFF_SCREENSHOTS,USE_LOCAL_BROWSER));
      return;
    }
    if (!doesScreenshotExist(name)) {
      if (SHOULD_SAVE_SCREENSHOTS_IF_NOT_EXIST) {
        updateActualScreenshot(name);
      } else {
        throw new NoReferenceScreenshotFoundException(name);
      }
    } else {
      makeImageDiff(name, shouldUpdateScreenshotIfDiffer);
    }
  }

  @SneakyThrows
  private void updateActualScreenshot(String name) {
    Screenshot actual =
        new AShot().coordsProvider(new WebDriverCoordsProvider()).takeScreenshot(getWebDriver());
    File  file=  newFile(SCREENSHOTS_FOLDER + name + ".png");
    ImageIO.write(actual.getImage(), "png", file);
    log.debug(String.format("created screenshot: %s \n at %s", name, file.getAbsolutePath()));
  }

  private static boolean doesScreenshotExist(String name) {
    return new File(SCREENSHOTS_FOLDER + name + ".png").exists();
  }

  @SneakyThrows
  private void makeImageDiff(String expectedName, boolean shouldUpdateScreenshotIfDiffer) {
    String fullPathNameExpected = SCREENSHOTS_FOLDER + expectedName + ".png";
    String fullPathNameActual = ACTUAL_SCREENSHOTS_FOLDER + expectedName + ".png";
    String fullPathNameDiff = DIFF_SCREENSHOTS_FOLDER + expectedName + ".png";

    //  activating allure plugin for showing diffs in report
    Allure.label("testType", "screenshotDiff");

    Screenshot actual =
        new AShot().coordsProvider(new WebDriverCoordsProvider()).takeScreenshot(getWebDriver());
    ImageIO.write(actual.getImage(), "png", newFile(fullPathNameActual));

    Screenshot expected = new Screenshot(ImageIO.read(newFile(fullPathNameExpected)));
    ImageDiff diff = new ImageDiffer().makeDiff(actual, expected);
    BufferedImage diffImage = diff.getMarkedImage();
    ImageIO.write(diffImage, "png", newFile(fullPathNameDiff));
    // adding to report
    diff(fullPathNameDiff);
    // adding to report
    actual(fullPathNameActual);
    // adding to report
    expected(fullPathNameExpected);

    if (shouldUpdateScreenshotIfDiffer) {
      if (diff.getDiffSize() > PIXELS_THRESHOLD) {
        updateActualScreenshot(expectedName);
      }
    } else {
      Assertions.assertTrue(
          PIXELS_THRESHOLD >= diff.getDiffSize(),
              String.format("Amount of differing pixels should be less or equals than %s, actual %s\n"+
                  "diff file: %s",
              PIXELS_THRESHOLD, diff.getDiffSize(), FileSystems.getDefault().getPath(fullPathNameDiff).normalize().toAbsolutePath()));
    }
  }

  @SneakyThrows
  private byte[] imgToBytes(String filename) {
    BufferedImage bImage2 = ImageIO.read(new File(filename));
    var bos2 = new ByteArrayOutputStream();
    ImageIO.write(bImage2, "png", bos2);
    return bos2.toByteArray();
  }

  @SneakyThrows
  @Attachment
  private byte[] actual(String actualFileName) {
    return imgToBytes(actualFileName);
  }

  @SneakyThrows
  @Attachment
  private byte[] expected(String expectedFileName) {
    return imgToBytes(expectedFileName);
  }

  @SneakyThrows
  @Attachment
  private byte[] diff(String diffFileName) {
    return imgToBytes(diffFileName);
  }
}
